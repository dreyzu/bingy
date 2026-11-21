import { inArray, lt } from "drizzle-orm";
import { notifications } from "../db/schemas";
import { db } from "../lib/database";
import { logger } from "../lib/logger";
import { syncUnread } from "../lib/notifications";
import type { ScheduledJob } from "../lib/scheduler";

/** Notifications are deleted this long after their last activity. */
const RETENTION_DAYS = 90;
/** Deleted per statement, to keep each one short. */
const BATCH_SIZE = 5000;

/** Deletes the notifications older than RETENTION_DAYS. */
export async function deleteExpiredNotifications() {
	const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
	const unreadRecipients = new Set<string>();
	let total = 0;
	let batchCount: number;

	// A full batch means more expired rows may be left.
	do {
		const expired = db
			.select({ id: notifications.id })
			.from(notifications)
			.where(lt(notifications.createdAt, cutoff))
			.limit(BATCH_SIZE);

		const deleted = await db
			.delete(notifications)
			.where(inArray(notifications.id, expired))
			.returning({
				recipientId: notifications.recipientId,
				readAt: notifications.readAt,
			});

		for (const row of deleted) {
			if (!row.readAt) unreadRecipients.add(row.recipientId);
		}
		batchCount = deleted.length;
		total += batchCount;
	} while (batchCount === BATCH_SIZE);

	// Their unread badge counted some of the deleted notifications.
	if (unreadRecipients.size > 0) {
		await syncUnread([...unreadRecipients], "removed");
	}

	return total;
}

export const deleteExpiredNotificationsJob: ScheduledJob = {
	name: "delete-expired-notifications",
	// Daily, at a quiet hour. Notifications live up to a day past retention.
	schedule: "0 3 * * *",
	run: async () => {
		const deleted = await deleteExpiredNotifications();
		if (deleted > 0) logger.info(`Deleted ${deleted} expired notifications`);
	},
};
