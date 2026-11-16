import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import { check, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./column.helper";
import { movieWatchHistory, tvShowWatchHistory } from "./tracking";
import { users } from "./user";

export const reviewComments = pgTable(
	"review_comments",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		movieWatchHistoryId: uuid("movie_watch_history_id").references(
			() => movieWatchHistory.id,
			{ onDelete: "cascade" },
		),
		tvShowWatchHistoryId: uuid("tv_show_watch_history_id").references(
			() => tvShowWatchHistory.id,
			{ onDelete: "cascade" },
		),
		comment: text("comment").notNull(),
		...timestamps,
	},
	(table) => [
		check(
			"review_comment_target_check",
			sql`((movie_watch_history_id IS NOT NULL)::int + (tv_show_watch_history_id IS NOT NULL)::int) = 1`,
		),
		index("idx_review_comments_movie").on(table.movieWatchHistoryId),
		index("idx_review_comments_tv").on(table.tvShowWatchHistoryId),
		index("idx_review_comments_user").on(table.userId),
	],
);

export type ReviewComment = InferSelectModel<typeof reviewComments>;
export type NewReviewComment = InferInsertModel<typeof reviewComments>;
