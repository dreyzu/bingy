import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
	index,
	integer,
	numeric,
	pgTable,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./column.helper";

export const media = pgTable(
	"media",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		tmdbId: integer("tmdb_id").notNull(),
		mediaType: varchar("media_type", { length: 10 }).notNull(),
		averageRating: numeric("average_rating", { precision: 2, scale: 1 }),
		ratingCount: integer("rating_count").notNull().default(0),
		...timestamps,
	},
	(table) => [
		unique().on(table.tmdbId, table.mediaType),
		index("idx_media_type").on(table.mediaType),
		index("idx_media_rating").on(table.averageRating),
		index("idx_media_tmdb").on(table.tmdbId),
	],
);

export type Media = InferSelectModel<typeof media>;
export type NewMedia = InferInsertModel<typeof media>;
