import { zValidator } from "@hono/zod-validator";
import { and, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import type { Schemas } from "shared";
import { z } from "zod";
import {
	type ArtworkKind,
	artworkKinds,
	media,
	mediaArtwork,
} from "../../db/schemas";
import {
	type ArtworkMediaType,
	invalidateScope,
} from "../../lib/artwork/store";
import type { auth } from "../../lib/auth";
import { db } from "../../lib/database";
import { APP_LOCALES } from "../../lib/locales";
import {
	serveNotFound,
	serveUnprocessableEntity,
} from "../../lib/responses/error";
import { serveData, serveNoContent } from "../../lib/responses/resp";
import { TmdbError, tmdbClient } from "../../lib/tmdb/tmdb-client";
import { requireAdmin } from "../middlewares/require-admin";
import { getOrCreateMedia } from "../utils/create-update-media";

type SessionUser = typeof auth.$Infer.Session.user;

type Variables = {
	user: SessionUser | null;
	session: unknown;
};

const mediaParamSchema = z.object({
	mediaType: z.enum(["movie", "tv"]),
	tmdbId: z.coerce.number().int().positive(),
});

const slotParamSchema = mediaParamSchema
	.extend({
		kind: z.enum(artworkKinds),
		// An app locale, or "all" for every locale.
		scope: z.enum(["all", ...APP_LOCALES]),
	})
	// Posters often carry the title, so they can differ per locale. Backdrops
	// apply to every locale.
	.refine(({ kind, scope }) => kind === "poster" || scope === "all", {
		message: "BACKDROP_LOCALE_NOT_ALLOWED",
		path: ["scope"],
	});

/**
 * Whose overrides a request reads and writes: admins edit the defaults
 * everyone sees (`userId` null). Once premium users are let in, they get
 * their own (`userId` = their id).
 */
const ownerIdOf = (user: SessionUser) =>
	user.role === "admin" ? null : user.id;

const ownerIs = (ownerId: string | null) =>
	ownerId === null
		? isNull(mediaArtwork.userId)
		: eq(mediaArtwork.userId, ownerId);

const localeIs = (locale: string | null) =>
	locale === null
		? isNull(mediaArtwork.locale)
		: eq(mediaArtwork.locale, locale);

const toLocale = (scope: "all" | (typeof APP_LOCALES)[number]) =>
	scope === "all" ? null : scope;

/** TMDB's posters and backdrops for a media, in every language. */
async function fetchImages(
	mediaType: ArtworkMediaType,
	tmdbId: number,
): Promise<Schemas.MovieImages> {
	if (mediaType === "movie") {
		return tmdbClient.get("/movie/{movie_id}/images", {
			query: {},
			path: { movie_id: tmdbId },
		});
	}
	return tmdbClient.get("/tv/{series_id}/images", {
		query: {},
		path: { series_id: tmdbId },
	});
}

const imagesOfKind = (images: Schemas.MovieImages, kind: ArtworkKind) =>
	(kind === "poster" ? images.posters : images.backdrops).filter(
		(image) => image.file_path !== null,
	);

const artworkRoutes = new Hono<{ Variables: Variables }>();

artworkRoutes.use("*", requireAdmin);

// List the images an override can be picked from
artworkRoutes.get(
	"/:mediaType/:tmdbId/images",
	zValidator("param", mediaParamSchema),
	async (c) => {
		const { mediaType, tmdbId } = c.req.valid("param");

		try {
			const images = await fetchImages(mediaType, tmdbId);
			return serveData(c, {
				posters: imagesOfKind(images, "poster"),
				backdrops: imagesOfKind(images, "backdrop"),
			});
		} catch (error) {
			if (error instanceof TmdbError && error.status === 404) {
				return serveNotFound(c, "Resource not found");
			}
			throw error;
		}
	},
);

// Get the current overrides of a media
artworkRoutes.get(
	"/:mediaType/:tmdbId",
	zValidator("param", mediaParamSchema),
	async (c) => {
		const user = c.get("user") as SessionUser;
		const { mediaType, tmdbId } = c.req.valid("param");

		const overrides = await db
			.select({
				kind: mediaArtwork.kind,
				locale: mediaArtwork.locale,
				filePath: mediaArtwork.filePath,
			})
			.from(mediaArtwork)
			.innerJoin(media, eq(media.id, mediaArtwork.mediaId))
			.where(
				and(
					eq(media.tmdbId, tmdbId),
					eq(media.mediaType, mediaType),
					ownerIs(ownerIdOf(user)),
				),
			);

		return serveData(c, { overrides });
	},
);

// Set the poster or backdrop of a media, for one locale or all of them
artworkRoutes.put(
	"/:mediaType/:tmdbId/:kind/:scope",
	zValidator("param", slotParamSchema),
	zValidator("json", z.object({ filePath: z.string().min(1).max(100) })),
	async (c) => {
		const user = c.get("user") as SessionUser;
		const { mediaType, tmdbId, kind, scope } = c.req.valid("param");
		const { filePath } = c.req.valid("json");
		const ownerId = ownerIdOf(user);
		const locale = toLocale(scope);

		let images: Schemas.MovieImages;
		try {
			images = await fetchImages(mediaType, tmdbId);
		} catch (error) {
			if (error instanceof TmdbError && error.status === 404) {
				return serveNotFound(c, "Resource not found");
			}
			throw error;
		}

		const isTmdbImage = imagesOfKind(images, kind).some(
			(image) => image.file_path === filePath,
		);
		if (!isTmdbImage) {
			return serveUnprocessableEntity(c, "UNKNOWN_IMAGE");
		}

		const override = await db.transaction(async (tx) => {
			const mediaId = await getOrCreateMedia(tx, tmdbId, mediaType);

			const [row] = await tx
				.insert(mediaArtwork)
				.values({
					mediaId,
					kind,
					locale,
					userId: ownerId,
					filePath,
					createdBy: user.id,
				})
				.onConflictDoUpdate({
					target: [
						mediaArtwork.mediaId,
						mediaArtwork.kind,
						mediaArtwork.locale,
						mediaArtwork.userId,
					],
					set: { filePath, updatedAt: new Date() },
				})
				.returning({
					kind: mediaArtwork.kind,
					locale: mediaArtwork.locale,
					filePath: mediaArtwork.filePath,
				});

			return row;
		});

		await invalidateScope({ userId: ownerId, locale });

		return serveData(c, override);
	},
);

// Go back to TMDB's image for one locale or all of them
artworkRoutes.delete(
	"/:mediaType/:tmdbId/:kind/:scope",
	zValidator("param", slotParamSchema),
	async (c) => {
		const user = c.get("user") as SessionUser;
		const { mediaType, tmdbId, kind, scope } = c.req.valid("param");
		const ownerId = ownerIdOf(user);
		const locale = toLocale(scope);

		const mediaEntry = await db.query.media.findFirst({
			where: and(eq(media.tmdbId, tmdbId), eq(media.mediaType, mediaType)),
			columns: { id: true },
		});

		if (mediaEntry) {
			await db
				.delete(mediaArtwork)
				.where(
					and(
						eq(mediaArtwork.mediaId, mediaEntry.id),
						eq(mediaArtwork.kind, kind),
						localeIs(locale),
						ownerIs(ownerId),
					),
				);
			await invalidateScope({ userId: ownerId, locale });
		}

		return serveNoContent(c);
	},
);

export default artworkRoutes;
