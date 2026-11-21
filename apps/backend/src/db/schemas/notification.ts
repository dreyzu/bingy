import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	pgTable,
	primaryKey,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const notificationTypes = [
	"new_follower",
	"follow_request",
	"follow_request_accepted",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

const typeCheck = (column: unknown) =>
	sql`${column} in ('new_follower', 'follow_request', 'follow_request_accepted')`;

// Something that happened to `recipientId`, usually caused by `actorId`.
// Only the type and the ids are stored: clients render the localized text.
export const notifications = pgTable(
	"notifications",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		recipientId: uuid("recipient_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		// Null for notifications not caused by a user (none yet).
		actorId: uuid("actor_id").references(() => users.id, {
			onDelete: "cascade",
		}),
		type: varchar("type", { length: 50 }).notNull().$type<NotificationType>(),
		readAt: timestamp("read_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("idx_notifications_recipient_created").on(
			table.recipientId,
			table.createdAt,
		),
		// For the cleanup of expired notifications, across every user.
		index("idx_notifications_created").on(table.createdAt),
		index("idx_notifications_recipient_unread")
			.on(table.recipientId)
			.where(sql`${table.readAt} is null`),
		// One notification per actor and type: repeating the action bumps the
		// existing row instead of stacking new ones.
		uniqueIndex("uq_notifications_recipient_actor_type").on(
			table.recipientId,
			table.actorId,
			table.type,
		),
		check("notifications_type_check", typeCheck(table.type)),
	],
);

// Per-type opt-outs. A missing row means the type is enabled.
export const notificationPreferences = pgTable(
	"notification_preferences",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: varchar("type", { length: 50 }).notNull().$type<NotificationType>(),
		enabled: boolean("enabled").notNull(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.type] }),
		check("notification_preferences_type_check", typeCheck(table.type)),
	],
);

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
