import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
	check,
	index,
	pgTable,
	primaryKey,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export type FollowStatus = "pending" | "accepted";

// A follow from `followerId` to `followingId`.
// Following a private account creates a `pending` row that becomes `accepted`
// once the followed user approves it. Public accounts are accepted right away.
export const follows = pgTable(
	"follows",
	{
		followerId: uuid("follower_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		followingId: uuid("following_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		status: varchar("status", { length: 20 })
			.notNull()
			.default("accepted")
			.$type<FollowStatus>(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		acceptedAt: timestamp("accepted_at"),
	},
	(table) => [
		primaryKey({ columns: [table.followerId, table.followingId] }),
		index("idx_follows_following_status").on(
			table.followingId,
			table.status,
			table.createdAt,
		),
		index("idx_follows_follower_status").on(
			table.followerId,
			table.status,
			table.createdAt,
		),
		check(
			"follows_no_self_follow",
			sql`${table.followerId} <> ${table.followingId}`,
		),
		check(
			"follows_status_check",
			sql`${table.status} in ('pending', 'accepted')`,
		),
	],
);

export type Follow = InferSelectModel<typeof follows>;
export type NewFollow = InferInsertModel<typeof follows>;
