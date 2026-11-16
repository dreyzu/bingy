import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./column.helper";
import { media } from "./media";
import { users } from "./user";

export const movieWatchHistory = pgTable(
	"movie_watch_history",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		mediaId: uuid("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		rating: numeric("rating", { precision: 2, scale: 1 }),
		review: text("review"),
		loggedAt: timestamp("logged_at").notNull().defaultNow(),
		watchedAt: timestamp("watched_at"),
	},
	(table) => [
		unique().on(table.userId, table.mediaId),
		check(
			"rating_range",
			sql`${table.rating} >= 0.5 AND ${table.rating} <= 5.0`,
		),
		index("idx_movie_watch_user").on(table.userId),
		index("idx_movie_watch_media").on(table.mediaId),
		index("idx_movie_watch_date").on(table.watchedAt),
	],
);

export const tvShowWatchHistory = pgTable(
	"tv_show_watch_history",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		mediaId: uuid("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		rating: numeric("rating", { precision: 2, scale: 1 }),
		review: text("review"),
		loggedAt: timestamp("logged_at").notNull().defaultNow(),
		watchedAt: timestamp("watched_at"),
	},
	(table) => [
		unique().on(table.userId, table.mediaId),
		check(
			"rating_range",
			sql`${table.rating} >= 0.5 AND ${table.rating} <= 5.0`,
		),
		index("idx_tv_show_watch_user").on(table.userId),
		index("idx_tv_show_watch_media").on(table.mediaId),
		index("idx_tv_show_watch_date").on(table.watchedAt),
	],
);

export const tvShowProgress = pgTable(
	"tv_show_progress",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		mediaId: uuid("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		lastWatchedSeason: integer("last_watched_season").notNull(),
		lastWatchedEpisode: integer("last_watched_episode").notNull(),
		absoluteEpisode: integer("absolute_episode"),
		// when the last watched episode (lastWatchedSeason/lastWatchedEpisode) was watched
		lastWatchedAt: timestamp("last_watched_at"),
		trackingMode: text("tracking_mode").notNull().default("season"),
		status: varchar("status", { length: 20 })
			.notNull()
			.default("watching")
			.$type<"watching" | "completed" | "on_hold" | "dropped">(),
		// number of times the user restarted the show after completing it
		rewatchCount: integer("rewatch_count").notNull().default(0),
		...timestamps,
	},
	(table) => [
		unique().on(table.userId, table.mediaId),
		index("idx_tv_show_progress_user").on(table.userId),
		index("idx_tv_show_progress_media").on(table.mediaId),
	],
);

// Watch history types
export type MovieWatchHistory = InferSelectModel<typeof movieWatchHistory>;
export type NewMovieWatchHistory = InferInsertModel<typeof movieWatchHistory>;

export type TvShowWatchHistory = InferSelectModel<typeof tvShowWatchHistory>;
export type NewTvShowWatchHistory = InferInsertModel<typeof tvShowWatchHistory>;

export type TvShowProgress = InferSelectModel<typeof tvShowProgress>;
export type NewTvShowProgress = InferInsertModel<typeof tvShowProgress>;
