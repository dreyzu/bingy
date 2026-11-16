import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { customLists, watchlist } from "./collection";
import { reviewComments } from "./review";
import {
	movieWatchHistory,
	tvShowProgress,
	tvShowWatchHistory,
} from "./tracking";
import { users } from "./user";

export const activity = pgTable(
	"activity",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		activityType: varchar("activity_type", { length: 50 }).notNull(),
		movieWatchHistoryId: uuid("movie_watch_history_id").references(
			() => movieWatchHistory.id,
			{ onDelete: "cascade" },
		),
		tvShowWatchHistoryId: uuid("tv_show_watch_history_id").references(
			() => tvShowWatchHistory.id,
			{ onDelete: "cascade" },
		),
		tvShowProgressId: uuid("tv_show_progress_id").references(
			() => tvShowProgress.id,
			{ onDelete: "cascade" },
		),
		reviewCommentId: uuid("review_comment_id").references(
			() => reviewComments.id,
			{ onDelete: "cascade" },
		),
		customListId: uuid("custom_list_id").references(() => customLists.id, {
			onDelete: "cascade",
		}),
		watchlistId: uuid("watchlist_id").references(() => watchlist.id, {
			onDelete: "cascade",
		}),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("idx_user_activity_user_date").on(table.userId, table.createdAt),
		index("idx_user_activity_type").on(table.activityType),
	],
);

export type Activity = InferSelectModel<typeof activity>;
export type NewActivity = InferInsertModel<typeof activity>;
