import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { media, tvShowProgress, type User } from "../../db/schemas";
import { db } from "../../lib/database";
import { logger } from "../../lib/logger";
import { loadViewableProfile } from "../../lib/profile-access";
import { TmdbError, tmdbClient } from "../../lib/tmdb/tmdb-client";
import { getOrCreateMedia } from "../../web/utils/create-update-media";
import {
	getAbsoluteEpisodeNumber,
	getAbsoluteFromSeasonEpisode,
	getLastAiredEpisode,
	getNextEpisodesForProgress,
	getSeasonsAfterEpisode,
	isEpisodeAfter,
	isEpisodeAired,
} from "../../web/utils/tv-helper";

type Variables = {
	user: User | null;
	session: unknown;
};

// statuses shown in the tracked shows list
const TRACKED_SHOW_STATUSES = [
	"watching",
	"on_hold",
	"dropped",
	"completed",
] as const;

// tmdb statuses for a show that will not air any more episodes
const isEndedShow = (tmdbStatus: string) =>
	tmdbStatus === "Ended" || tmdbStatus === "Canceled";
type TrackedShowStatus = (typeof TRACKED_SHOW_STATUSES)[number];
const TRACKED_SHOW_STATUS_FILTERS = ["all", ...TRACKED_SHOW_STATUSES] as const;

const userProgressRoutes = new Hono<{ Variables: Variables }>();

// get all tv shows with pending episodes for a user
userProgressRoutes.get(
	"/:username/tv",
	zValidator(
		"query",
		z.object({
			language: z.string().default("en-US"),
			limit: z.coerce.number().int().min(1).max(100).default(24),
			page: z.coerce.number().int().min(1).default(1),
			status: z.enum(TRACKED_SHOW_STATUS_FILTERS).default("all"),
		}),
	),
	async (c) => {
		const { username } = c.req.param();
		const { language, limit, page, status: statusQuery } = c.req.valid("query");
		const offset = (page - 1) * limit;

		const statuses: TrackedShowStatus[] =
			statusQuery === "all"
				? [...TRACKED_SHOW_STATUSES]
				: [statusQuery as TrackedShowStatus];

		const profile = await loadViewableProfile(c, username);
		if (!profile.ok) {
			return c.json({ error: profile.error }, profile.status);
		}
		const targetUser = profile.user;

		const filters = and(
			eq(tvShowProgress.userId, targetUser.id),
			eq(media.mediaType, "tv"),
			inArray(tvShowProgress.status, statuses),
		);

		try {
			const [dbItems, totalCountResult] = await Promise.all([
				db
					.select({
						progress: tvShowProgress,
						media: media,
					})
					.from(tvShowProgress)
					.innerJoin(media, eq(tvShowProgress.mediaId, media.id))
					.where(filters)
					.orderBy(desc(tvShowProgress.updatedAt))
					.limit(limit)
					.offset(offset),

				db
					.select({ count: sql<number>`count(*)` })
					.from(tvShowProgress)
					.innerJoin(media, eq(tvShowProgress.mediaId, media.id))
					.where(filters),
			]);

			const totalResults = Number(totalCountResult[0]?.count ?? 0);

			const hydratedData = (
				await Promise.all(
					dbItems.map(async (item) => {
						try {
							const tvDetails = await tmdbClient.get("/tv/{series_id}", {
								query: { language },
								path: { series_id: item.media.tmdbId },
							});

							const nextEpisodes = await getNextEpisodesForProgress(
								item.media.tmdbId,
								tvDetails,
								language,
								item.progress,
							);

							// show has ended and nothing is left to watch: it is completed
							// a completed show with a new episode already out goes back to watching
							// (the next episodes include ones airing soon, which must not reopen it)
							let status = item.progress.status;
							const nextEpisode = nextEpisodes[0];
							const shouldComplete =
								status === "watching" &&
								!nextEpisode &&
								isEndedShow(tvDetails.status);
							const shouldReopen =
								status === "completed" &&
								nextEpisode !== undefined &&
								isEpisodeAired(nextEpisode.air_date, new Date(), 0);
							if (shouldComplete || shouldReopen) {
								status = shouldComplete ? "completed" : "watching";
								await db
									.update(tvShowProgress)
									.set({ status, updatedAt: new Date() })
									.where(eq(tvShowProgress.id, item.progress.id));
							}

							return {
								id: tvDetails.id,
								name: tvDetails.name,
								original_name: tvDetails.original_name,
								poster_path: tvDetails.poster_path,
								status: tvDetails.status,
								tagline: tvDetails.tagline,
								last_episode_to_air: tvDetails.last_episode_to_air,
								number_of_seasons: tvDetails.number_of_seasons,
								number_of_episodes: tvDetails.number_of_episodes,
								progress: {
									id: item.progress.id,
									lastWatchedSeason: item.progress.lastWatchedSeason,
									lastWatchedEpisode: item.progress.lastWatchedEpisode,
									absoluteEpisode: item.progress.absoluteEpisode,
									lastWatchedAt: item.progress.lastWatchedAt,
									trackingMode: item.progress.trackingMode,
									status,
									rewatchCount: item.progress.rewatchCount,
									createdAt: item.progress.createdAt,
									updatedAt: item.progress.updatedAt,
								},
								nextEpisodes,
							};
						} catch (error) {
							if (error instanceof TmdbError && error.status === 404)
								return null;
							throw error;
						}
					}),
				)
			).filter((item) => item !== null);

			return c.json({
				data: hydratedData,
				page,
				total_pages: Math.ceil(totalResults / limit),
				total_results: totalResults,
			});
		} catch (error) {
			logger.error(error);
			return c.json({ error: "Failed to fetch TV progress" }, 500);
		}
	},
);

// get a tv show progress from an user by username - returns null if the show is not tracked
userProgressRoutes.get("/:username/tv/:tmdbId", async (c) => {
	const { username, tmdbId } = c.req.param();
	const tmdbIdNumber = Number(tmdbId);
	if (!Number.isInteger(tmdbIdNumber))
		return c.json({ error: "INVALID_TMDB_ID" }, 400);

	const profile = await loadViewableProfile(c, username);
	if (!profile.ok) {
		return c.json({ error: profile.error }, profile.status);
	}
	const targetUser = profile.user;

	try {
		const [row] = await db
			.select({ progress: tvShowProgress })
			.from(tvShowProgress)
			.innerJoin(media, eq(tvShowProgress.mediaId, media.id))
			.where(
				and(
					eq(tvShowProgress.userId, targetUser.id),
					eq(media.mediaType, "tv"),
					eq(media.tmdbId, tmdbIdNumber),
				),
			)
			.limit(1);

		return c.json(row?.progress ?? null);
	} catch (error) {
		logger.error(error);
		return c.json({ error: "Failed to fetch TV progress" }, 500);
	}
});

// find the logged in user's progress entry for a tv show
const findOwnTvProgress = async (userId: string, tmdbId: number) => {
	const [row] = await db
		.select({
			id: tvShowProgress.id,
			status: tvShowProgress.status,
			trackingMode: tvShowProgress.trackingMode,
			lastWatchedSeason: tvShowProgress.lastWatchedSeason,
			lastWatchedEpisode: tvShowProgress.lastWatchedEpisode,
		})
		.from(tvShowProgress)
		.innerJoin(media, eq(tvShowProgress.mediaId, media.id))
		.where(
			and(
				eq(tvShowProgress.userId, userId),
				eq(media.mediaType, "tv"),
				eq(media.tmdbId, tmdbId),
			),
		)
		.limit(1);

	return row ?? null;
};

// create or update tv show progress - seasonNumber and episodeNumber are the last episode the user watched
// user must be logged in
userProgressRoutes.post(
	"/tv",
	zValidator(
		"json",
		z.object({
			tmdbId: z.number(),
			rating: z.number().min(0.5).max(5.0).optional(),
			review: z.string().optional(),
			watchedAt: z.iso.datetime().optional(),
			seasonNumber: z.number().min(1).optional(),
			episodeNumber: z.number().min(1).optional(),
			absoluteEpisode: z.number().optional(),
			trackingMode: z.enum(["season", "absolute"]).optional(),
			status: z.enum(["watching", "on_hold", "dropped"]).optional(),
		}),
	),
	async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "UNAUTHORIZED" }, 401);

		const data = c.req.valid("json");
		const { seasonNumber, episodeNumber } = data;

		if (seasonNumber === undefined || episodeNumber === undefined) {
			return c.json({ error: "SEASON_AND_EPISODE_REQUIRED" }, 400);
		}

		const language = c.req.query("language") || "en-US";
		const trackingMode = data.trackingMode ?? "season";
		// seasonNumber/episodeNumber is the episode that was watched at this date
		const lastWatchedAt = data.watchedAt
			? new Date(data.watchedAt)
			: new Date();

		try {
			const absoluteEpisode =
				trackingMode === "absolute"
					? await getAbsoluteFromSeasonEpisode(
							data.tmdbId,
							seasonNumber,
							episodeNumber,
							language,
						)
					: null;

			// marking the final episode of an ended show completes it
			// marking a newer episode of a completed show puts it back to watching
			let autoStatus: "completed" | "watching" | undefined;
			if (!data.status) {
				try {
					const tvDetails = await tmdbClient.get("/tv/{series_id}", {
						query: { language },
						path: { series_id: data.tmdbId },
					});
					if (
						isEndedShow(tvDetails.status) &&
						getSeasonsAfterEpisode(
							tvDetails.seasons,
							seasonNumber,
							episodeNumber,
						).length === 0
					) {
						autoStatus = "completed";
					}
				} catch (error) {
					logger.error(error);
				}

				if (!autoStatus) {
					const existing = await findOwnTvProgress(user.id, data.tmdbId);
					if (
						existing?.status === "completed" &&
						isEpisodeAfter(
							{ season: seasonNumber, episode: episodeNumber },
							{
								season: existing.lastWatchedSeason,
								episode: existing.lastWatchedEpisode,
							},
						)
					) {
						autoStatus = "watching";
					}
				}
			}

			const progress = await db.transaction(async (tx) => {
				const mediaId = await getOrCreateMedia(tx, data.tmdbId, "tv");

				const [entry] = await tx
					.insert(tvShowProgress)
					.values({
						userId: user.id,
						mediaId,
						lastWatchedSeason: seasonNumber,
						lastWatchedEpisode: episodeNumber,
						absoluteEpisode,
						lastWatchedAt,
						trackingMode,
						status: data.status ?? autoStatus ?? "watching",
					})
					.onConflictDoUpdate({
						target: [tvShowProgress.userId, tvShowProgress.mediaId],
						set: {
							lastWatchedSeason: seasonNumber,
							lastWatchedEpisode: episodeNumber,
							absoluteEpisode,
							lastWatchedAt,
							trackingMode,
							// only change status when explicitly provided
							...(data.status
								? { status: data.status }
								: autoStatus
									? { status: autoStatus }
									: {}),
							updatedAt: new Date(),
						},
					})
					.returning();

				if (!entry) throw new Error("FAILED_UPSERT_TV_PROGRESS");

				return entry;
			});

			return c.json(progress, 201);
		} catch (error) {
			logger.error(error);
			return c.json({ error: "Failed to update TV progress" }, 500);
		}
	},
);

// change the status of a tv show progress
// user must be logged in
userProgressRoutes.patch(
	"/tv/:tmdbId",
	zValidator("param", z.object({ tmdbId: z.coerce.number().int() })),
	zValidator("json", z.object({ status: z.enum(TRACKED_SHOW_STATUSES) })),
	async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "UNAUTHORIZED" }, 401);

		const { tmdbId } = c.req.valid("param");
		const { status } = c.req.valid("json");

		try {
			const entry = await findOwnTvProgress(user.id, tmdbId);
			if (!entry) return c.json({ error: "PROGRESS_NOT_FOUND" }, 404);

			// completing a show moves its progress to the latest aired episode
			let completedProgress: {
				lastWatchedSeason: number;
				lastWatchedEpisode: number;
				absoluteEpisode: number | null;
				lastWatchedAt: Date;
			} | null = null;
			if (status === "completed" && entry.status !== "completed") {
				const language = c.req.query("language") || "en-US";
				const tvDetails = await tmdbClient.get("/tv/{series_id}", {
					query: { language },
					path: { series_id: tmdbId },
				});
				const lastAired = getLastAiredEpisode(tvDetails);
				if (
					lastAired &&
					isEpisodeAfter(lastAired, {
						season: entry.lastWatchedSeason,
						episode: entry.lastWatchedEpisode,
					})
				) {
					completedProgress = {
						lastWatchedSeason: lastAired.season,
						lastWatchedEpisode: lastAired.episode,
						absoluteEpisode:
							entry.trackingMode === "absolute"
								? getAbsoluteEpisodeNumber(
										tvDetails.seasons,
										lastAired.season,
										lastAired.episode,
									)
								: null,
						// the remaining episodes are considered watched now
						lastWatchedAt: new Date(),
					};
				}
			}

			const [progress] = await db
				.update(tvShowProgress)
				.set({ ...completedProgress, status, updatedAt: new Date() })
				.where(eq(tvShowProgress.id, entry.id))
				.returning();

			return c.json(progress);
		} catch (error) {
			logger.error(error);
			return c.json({ error: "Failed to update TV progress status" }, 500);
		}
	},
);

// restart a completed tv show from the beginning, keeping count of the rewatches
// user must be logged in
userProgressRoutes.post(
	"/tv/:tmdbId/rewatch",
	zValidator("param", z.object({ tmdbId: z.coerce.number().int() })),
	async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "UNAUTHORIZED" }, 401);

		const { tmdbId } = c.req.valid("param");

		try {
			const entry = await findOwnTvProgress(user.id, tmdbId);
			if (!entry) return c.json({ error: "PROGRESS_NOT_FOUND" }, 404);
			if (entry.status !== "completed")
				return c.json({ error: "SHOW_NOT_COMPLETED" }, 409);

			// season 0 (specials) is skipped, so the next episode is S1E1
			const [progress] = await db
				.update(tvShowProgress)
				.set({
					lastWatchedSeason: 0,
					lastWatchedEpisode: 0,
					absoluteEpisode: entry.trackingMode === "absolute" ? 0 : null,
					lastWatchedAt: null,
					status: "watching",
					rewatchCount: sql`${tvShowProgress.rewatchCount} + 1`,
					updatedAt: new Date(),
				})
				.where(eq(tvShowProgress.id, entry.id))
				.returning();

			return c.json(progress);
		} catch (error) {
			logger.error(error);
			return c.json({ error: "Failed to rewatch TV show" }, 500);
		}
	},
);

// remove a tv show from the tracked shows list, resetting its progress entirely
// user must be logged in
userProgressRoutes.delete(
	"/tv/:tmdbId",
	zValidator("param", z.object({ tmdbId: z.coerce.number().int() })),
	async (c) => {
		const user = c.get("user");
		if (!user) return c.json({ error: "UNAUTHORIZED" }, 401);

		const { tmdbId } = c.req.valid("param");

		try {
			const entry = await findOwnTvProgress(user.id, tmdbId);
			if (!entry) return c.json({ error: "PROGRESS_NOT_FOUND" }, 404);

			await db.delete(tvShowProgress).where(eq(tvShowProgress.id, entry.id));

			return c.body(null, 204);
		} catch (error) {
			logger.error(error);
			return c.json({ error: "Failed to remove TV progress" }, 500);
		}
	},
);

export default userProgressRoutes;
