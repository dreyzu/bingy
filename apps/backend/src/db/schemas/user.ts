import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./column.helper";

export const users = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		name: varchar("name", { length: 30 }).notNull().unique(),
		displayName: varchar("display_name", { length: 30 }).notNull().unique(),
		bio: varchar("bio", { length: 160 }),
		location: varchar("location", { length: 30 }),
		email: varchar("email", { length: 256 }).unique().notNull(),
		avatarUrl: text("avatar_url"),
		bannerUrl: text("banner_url"),
		emailVerified: boolean("email_verified").default(false).notNull(),
		emailVerifiedAt: timestamp("email_verified_at"),
		twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
		lastLoginMethod: text("last_login_method"),
		...timestamps,
	},
	(table) => [index("idx_users_name").on(table.name)],
);

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
