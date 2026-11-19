import { type InferSelectModel, sql } from "drizzle-orm";
import {
	check,
	index,
	pgTable,
	primaryKey,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user";

// `blockerId` blocked `blockedId`. While a block exists in either direction,
// the two users can't follow each other or see each other's profile content.
export const blocks = pgTable(
	"blocks",
	{
		blockerId: uuid("blocker_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		blockedId: uuid("blocked_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		primaryKey({ columns: [table.blockerId, table.blockedId] }),
		index("idx_blocks_blocker_created").on(table.blockerId, table.createdAt),
		index("idx_blocks_blocked").on(table.blockedId),
		check(
			"blocks_no_self_block",
			sql`${table.blockerId} <> ${table.blockedId}`,
		),
	],
);

export type Block = InferSelectModel<typeof blocks>;
