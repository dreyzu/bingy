import { and, eq, isNull } from "drizzle-orm";
import { type ArtworkKind, media, mediaArtwork } from "../../db/schemas";
import { cacheClient } from "../cache-client";
import { db } from "../database";
import type { AppLocale } from "../locales";

export type ArtworkMediaType = "movie" | "tv";

/** One image slot of a media, e.g. the poster of movie 550. */
export type ArtworkRef = {
	mediaType: ArtworkMediaType;
	tmdbId: number;
	kind: ArtworkKind;
};

export type ArtworkOverride = {
	filePath: string;
	/** Backdrops only: vertical crop position, 0 (top) to 100 (bottom). */
	focusY: number | null;
};

/** A set of overrides that apply together. Each one is cached as a Redis hash. */
export type ArtworkScope = {
	/** Null for the admin defaults. */
	userId: string | null;
	/** Null for every locale. */
	locale: AppLocale | null;
};

// Writes invalidate the hash. The TTL bounds how long another server can keep
// a scope it loaded just before a write.
const SCOPE_TTL = 60 * 60;

// Tells a loaded scope without overrides apart from a scope not loaded yet.
const LOADED_FIELD = "~loaded";

const scopeKey = ({ userId, locale }: ArtworkScope) =>
	`artwork:${userId ?? "admin"}:${locale ?? "all"}`;

export const artworkField = ({ mediaType, tmdbId, kind }: ArtworkRef) =>
	`${mediaType}:${tmdbId}:${kind}`;

// Requests that miss the same scope at once share one database query.
const pendingLoads = new Map<
	string,
	Promise<Record<string, ArtworkOverride>>
>();

// Bumped on each write, so a load that read the database before the write
// does not cache what it read.
const generations = new Map<string, number>();

async function loadScope(
	scope: ArtworkScope,
): Promise<Record<string, ArtworkOverride>> {
	const key = scopeKey(scope);
	const generation = generations.get(key) ?? 0;

	const rows = await db
		.select({
			tmdbId: media.tmdbId,
			mediaType: media.mediaType,
			kind: mediaArtwork.kind,
			filePath: mediaArtwork.filePath,
			focusY: mediaArtwork.focusY,
		})
		.from(mediaArtwork)
		.innerJoin(media, eq(media.id, mediaArtwork.mediaId))
		.where(
			and(
				scope.userId === null
					? isNull(mediaArtwork.userId)
					: eq(mediaArtwork.userId, scope.userId),
				scope.locale === null
					? isNull(mediaArtwork.locale)
					: eq(mediaArtwork.locale, scope.locale),
			),
		);

	const overrides: Record<string, ArtworkOverride> = {};
	const encoded: Record<string, string> = { [LOADED_FIELD]: "1" };
	for (const row of rows) {
		const field = artworkField({
			mediaType: row.mediaType as ArtworkMediaType,
			tmdbId: row.tmdbId,
			kind: row.kind,
		});
		overrides[field] = { filePath: row.filePath, focusY: row.focusY };
		encoded[field] = JSON.stringify(overrides[field]);
	}

	if ((generations.get(key) ?? 0) === generation) {
		await cacheClient.hset(key, encoded, SCOPE_TTL);
	}
	return overrides;
}

/** The override set in `scope` for each of `fields`, or null where none is set. */
export async function getScopeOverrides(
	scope: ArtworkScope,
	fields: string[],
): Promise<Array<ArtworkOverride | null>> {
	const key = scopeKey(scope);
	const cached = await cacheClient.hmget(key, [LOADED_FIELD, ...fields]);
	if (cached && cached[0] !== null) {
		return cached
			.slice(1)
			.map((value) =>
				value === null ? null : (JSON.parse(value) as ArtworkOverride),
			);
	}

	let load = pendingLoads.get(key);
	if (!load) {
		const started = loadScope(scope).finally(() => {
			if (pendingLoads.get(key) === started) pendingLoads.delete(key);
		});
		pendingLoads.set(key, started);
		load = started;
	}
	const overrides = await load;
	return fields.map((field) => overrides[field] ?? null);
}

/** Drops the cached scope after a write, so the next read reloads it. */
export async function invalidateScope(scope: ArtworkScope): Promise<void> {
	const key = scopeKey(scope);
	generations.set(key, (generations.get(key) ?? 0) + 1);
	pendingLoads.delete(key);
	await cacheClient.delete(key);
}
