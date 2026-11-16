import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	primaryKey,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./column.helper";
import { media } from "./media";
import { users } from "./user";

export const watchlist = pgTable(
	"watchlist",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		mediaId: uuid("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		addedAt: timestamp("added_at").notNull().defaultNow(),
	},
	(table) => [
		unique().on(table.userId, table.mediaId),
		index("idx_watchlist_user").on(table.userId),
		index("idx_watchlist_media").on(table.mediaId),
	],
);

export const favorites = pgTable(
	"favorites",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		mediaId: uuid("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		addedAt: timestamp("added_at").notNull().defaultNow(),
	},
	(table) => [
		unique().on(table.userId, table.mediaId),
		index("idx_favorites_user").on(table.userId),
		index("idx_favorites_media").on(table.mediaId),
	],
);

export const customLists = pgTable(
	"custom_lists",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 200 }).notNull(),
		slug: varchar("slug", { length: 300 }).notNull(),
		type: varchar("type", { length: 20 })
			.notNull()
			.default("unranked")
			.$type<"unranked" | "ranked">(),
		description: varchar("description", { length: 2000 }),
		visibility: varchar("visibility", { length: 20 })
			.notNull()
			.default("public")
			.$type<"private" | "public" | "limited">(),
		...timestamps,
	},
	(table) => [
		index("idx_custom_lists_user").on(table.userId),
		unique("unique_user_name").on(table.userId, table.name),
		unique("unique_user_slug").on(table.userId, table.slug),
	],
);

export const listItems = pgTable(
	"list_items",
	{
		listId: uuid("list_id")
			.notNull()
			.references(() => customLists.id, { onDelete: "cascade" }),
		mediaId: uuid("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		position: integer("position"), // null for unranked
		note: varchar("note", { length: 1000 }),
		addedAt: timestamp("added_at").notNull().defaultNow(),
	},
	(table) => [
		primaryKey({ columns: [table.listId, table.mediaId] }),
		index("idx_list_items_list").on(table.listId),
		index("idx_list_items_media").on(table.mediaId),
		index("idx_list_items_position").on(table.listId, table.position),
		unique("unique_list_position").on(table.listId, table.position),
	],
);

// List types
export type Watchlist = InferSelectModel<typeof watchlist>;
export type NewWatchlist = InferInsertModel<typeof watchlist>;
export type CustomList = InferSelectModel<typeof customLists>;
export type NewCustomList = InferInsertModel<typeof customLists>;
export type ListItem = InferSelectModel<typeof listItems>;
export type NewListItem = InferInsertModel<typeof listItems>;

// Favorite types
export type Favorite = InferSelectModel<typeof favorites>;
export type NewFavorite = InferInsertModel<typeof favorites>;
