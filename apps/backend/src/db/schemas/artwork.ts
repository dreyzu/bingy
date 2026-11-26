import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
	check,
	index,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { media } from "./media";
import { users } from "./user";

export const artworkKinds = ["poster", "backdrop"] as const;

export type ArtworkKind = (typeof artworkKinds)[number];

/**
 * A poster or backdrop shown instead of TMDB's for a media. `filePath` is a
 * TMDB image path, so it is served with the usual TMDB image URLs and sizes.
 */
export const mediaArtwork = pgTable(
	"media_artwork",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		mediaId: uuid("media_id")
			.notNull()
			.references(() => media.id, { onDelete: "cascade" }),
		kind: varchar("kind", { length: 10 }).notNull().$type<ArtworkKind>(),
		// App locale, or null for every locale. Always null for backdrops.
		locale: varchar("locale", { length: 10 }),
		// Null for the admin default everyone sees, set for a user's own pick.
		userId: uuid("user_id").references(() => users.id, {
			onDelete: "cascade",
		}),
		filePath: varchar("file_path", { length: 100 }).notNull(),
		createdBy: uuid("created_by").references(() => users.id, {
			onDelete: "set null",
		}),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		unique("uq_media_artwork_media_kind_locale_user")
			.on(table.mediaId, table.kind, table.locale, table.userId)
			.nullsNotDistinct(),
		// Loading every override of one owner and locale into the cache.
		index("idx_media_artwork_user_locale").on(table.userId, table.locale),
		check(
			"media_artwork_kind_check",
			sql`${table.kind} in ('poster', 'backdrop')`,
		),
		// Posters often carry the title, so they can differ per locale.
		// Backdrops apply to every locale.
		check(
			"media_artwork_backdrop_locale_check",
			sql`${table.kind} = 'poster' or ${table.locale} is null`,
		),
	],
);

export type MediaArtwork = InferSelectModel<typeof mediaArtwork>;
export type NewMediaArtwork = InferInsertModel<typeof mediaArtwork>;
