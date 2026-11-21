import { and, eq, inArray, isNull, lt } from "drizzle-orm";
import { notifications, users } from "../db/schemas";
import { sendEmail } from "../emails";
import { db } from "../lib/database";
import env from "../lib/env";
import { logger } from "../lib/logger";
import { syncUnread } from "../lib/notifications";
import type { ScheduledJob } from "../lib/scheduler";
import { deleteImageByUrl } from "../web/utils/image";

/** Accounts whose email is still not verified this long after sign-up are deleted. */
const UNVERIFIED_ACCOUNT_DAYS = 30;

/**
 * Deletes the accounts that never verified their email. Every table that
 * references a user cascades, so this removes all of their data; their
 * uploaded images are removed from the bucket and they get an email.
 */
export async function deleteUnverifiedAccounts() {
	const cutoff = new Date(
		Date.now() - UNVERIFIED_ACCOUNT_DAYS * 24 * 60 * 60 * 1000,
	);

	const { deleted, affectedRecipients } = await db.transaction(async (tx) => {
		const expired = await tx
			.select({ id: users.id })
			.from(users)
			.where(and(eq(users.emailVerified, false), lt(users.createdAt, cutoff)));
		if (expired.length === 0) {
			return { deleted: [], affectedRecipients: [] };
		}
		const ids = expired.map((user) => user.id);

		// Unread notifications they caused disappear with them.
		const recipients = await tx
			.selectDistinct({ id: notifications.recipientId })
			.from(notifications)
			.where(
				and(inArray(notifications.actorId, ids), isNull(notifications.readAt)),
			);

		const deleted = await tx
			.delete(users)
			.where(inArray(users.id, ids))
			.returning({
				name: users.name,
				email: users.email,
				avatarUrl: users.avatarUrl,
				bannerUrl: users.bannerUrl,
			});

		return {
			deleted,
			affectedRecipients: recipients
				.map((recipient) => recipient.id)
				.filter((id) => !ids.includes(id)),
		};
	});

	await Promise.all(
		deleted.flatMap((user) => [
			deleteImageByUrl(user.avatarUrl),
			deleteImageByUrl(user.bannerUrl),
		]),
	);

	if (affectedRecipients.length > 0) {
		await syncUnread(affectedRecipients, "removed");
	}

	// One at a time, to stay under the email provider's rate limit.
	for (const user of deleted) {
		const result = await sendEmail({
			type: "unverified-account-deleted",
			to: user.email,
			fromEmail: env.TRANSACTIONAL_EMAIL,
			fromName: env.APP_NAME,
			userName: user.name,
			days: UNVERIFIED_ACCOUNT_DAYS,
		});
		if (!result.success) {
			logger.error(
				{ error: result.error },
				"Failed to send the unverified account deletion email",
			);
		}
	}

	return deleted.length;
}

export const deleteUnverifiedAccountsJob: ScheduledJob = {
	name: "delete-unverified-accounts",
	// Daily, at a quiet hour.
	schedule: "30 3 * * *",
	run: async () => {
		const deleted = await deleteUnverifiedAccounts();
		if (deleted > 0) logger.info(`Deleted ${deleted} unverified accounts`);
	},
};
