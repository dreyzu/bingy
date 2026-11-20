import { and, count, eq, inArray, isNull, or, sql } from "drizzle-orm";
import {
	type NotificationType,
	notificationPreferences,
	notifications,
	notificationTypes,
} from "../db/schemas";
import { db, type Transaction } from "./database";
import { logger } from "./logger";
import {
	type NotificationEventReason,
	publishToUser,
} from "./notification-events";

type NotificationEntry = {
	recipientId: string;
	actorId: string;
	type: NotificationType;
};

export type NotificationPreferences = Record<NotificationType, boolean>;

/**
 * Notifications are a side effect of the action that caused them: a failure
 * here is logged and never fails that action.
 */
async function safely(task: () => Promise<void>, message: string) {
	try {
		await task();
	} catch (error) {
		logger.error(error, message);
	}
}

export async function countUnread(userId: string) {
	const [row] = await db
		.select({ count: count() })
		.from(notifications)
		.where(
			and(eq(notifications.recipientId, userId), isNull(notifications.readAt)),
		);
	return row?.count ?? 0;
}

/** Sends the new unread count to every open stream of these users. */
export async function syncUnread(
	userIds: string[],
	reason: NotificationEventReason,
) {
	await Promise.all(
		[...new Set(userIds)].map(async (userId) =>
			publishToUser(userId, { reason, unreadCount: await countUnread(userId) }),
		),
	);
}

export async function getPreferences(
	userId: string,
): Promise<NotificationPreferences> {
	const rows = await db
		.select({
			type: notificationPreferences.type,
			enabled: notificationPreferences.enabled,
		})
		.from(notificationPreferences)
		.where(eq(notificationPreferences.userId, userId));

	const preferences = Object.fromEntries(
		notificationTypes.map((type) => [type, true]),
	) as NotificationPreferences;
	for (const row of rows) preferences[row.type] = row.enabled;
	return preferences;
}

export async function updatePreferences(
	userId: string,
	changes: Partial<NotificationPreferences>,
) {
	const rows = Object.entries(changes).map(([type, enabled]) => ({
		userId,
		type: type as NotificationType,
		enabled,
	}));

	if (rows.length > 0) {
		await db
			.insert(notificationPreferences)
			.values(rows)
			.onConflictDoUpdate({
				target: [notificationPreferences.userId, notificationPreferences.type],
				set: {
					enabled: sql`excluded.enabled`,
					updatedAt: new Date(),
				},
			});
	}

	return getPreferences(userId);
}

/** `userId:type` pairs that were turned off by their recipient. */
async function findDisabled(entries: NotificationEntry[]) {
	const rows = await db
		.select({
			userId: notificationPreferences.userId,
			type: notificationPreferences.type,
		})
		.from(notificationPreferences)
		.where(
			and(
				inArray(
					notificationPreferences.userId,
					entries.map((entry) => entry.recipientId),
				),
				eq(notificationPreferences.enabled, false),
			),
		);
	return new Set(rows.map((row) => `${row.userId}:${row.type}`));
}

/**
 * Creates notifications, skipping the types their recipient turned off.
 * Notifying again for the same actor and type moves the existing one back to
 * the top as unread.
 */
export function notify(...entries: NotificationEntry[]) {
	return safely(async () => {
		if (entries.length === 0) return;

		const disabled = await findDisabled(entries);
		const allowed = entries.filter(
			(entry) => !disabled.has(`${entry.recipientId}:${entry.type}`),
		);
		if (allowed.length === 0) return;

		await db
			.insert(notifications)
			.values(allowed)
			.onConflictDoUpdate({
				target: [
					notifications.recipientId,
					notifications.actorId,
					notifications.type,
				],
				set: { createdAt: new Date(), readAt: null },
			});

		await syncUnread(
			allowed.map((entry) => entry.recipientId),
			"created",
		);
	}, "Failed to create notifications");
}

/** Removes notifications whose cause was undone (unfollow, cancelled request…). */
export function retract(
	recipientId: string,
	actorId: string,
	types: NotificationType[],
) {
	return safely(async () => {
		const removed = await db
			.delete(notifications)
			.where(
				and(
					eq(notifications.recipientId, recipientId),
					eq(notifications.actorId, actorId),
					inArray(notifications.type, types),
				),
			)
			.returning({ id: notifications.id });

		if (removed.length > 0) await syncUnread([recipientId], "removed");
	}, "Failed to retract notifications");
}

/**
 * Turns the follow request notifications that `recipientId` got from these
 * users into (read) new follower notifications once the requests are
 * accepted, so they keep their place in the list. They're removed instead
 * when the recipient turned new follower notifications off.
 */
export function resolveFollowRequests(recipientId: string, actorIds: string[]) {
	return safely(async () => {
		if (actorIds.length === 0) return;

		const { new_follower: keep } = await getPreferences(recipientId);
		const fromActors = (type: NotificationType) =>
			and(
				eq(notifications.recipientId, recipientId),
				inArray(notifications.actorId, actorIds),
				eq(notifications.type, type),
			);

		const changed = await db.transaction(async (tx) => {
			if (!keep) {
				return tx
					.delete(notifications)
					.where(fromActors("follow_request"))
					.returning({ id: notifications.id });
			}

			// Leaves room for the converted rows in the unique index.
			await tx.delete(notifications).where(fromActors("new_follower"));
			return tx
				.update(notifications)
				.set({
					type: "new_follower",
					readAt: sql`coalesce(${notifications.readAt}, now())`,
				})
				.where(fromActors("follow_request"))
				.returning({ id: notifications.id });
		});

		if (changed.length > 0) await syncUnread([recipientId], "updated");
	}, "Failed to resolve follow request notifications");
}

/**
 * Deletes every notification between two users, in both directions. Runs
 * inside the caller's transaction: call `syncUnread` for both users once it
 * is committed.
 */
export async function deleteNotificationsBetween(
	tx: Transaction,
	userA: string,
	userB: string,
) {
	await tx
		.delete(notifications)
		.where(
			or(
				and(
					eq(notifications.recipientId, userA),
					eq(notifications.actorId, userB),
				),
				and(
					eq(notifications.recipientId, userB),
					eq(notifications.actorId, userA),
				),
			),
		);
}
