import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import {
	notifications,
	notificationTypes,
	type User,
	users,
} from "../../db/schemas";
import { db } from "../../lib/database";
import { getViewerRelations } from "../../lib/follow-relations";
import { logger } from "../../lib/logger";
import {
	listenToUser,
	type NotificationEvent,
} from "../../lib/notification-events";
import {
	countUnread,
	getPreferences,
	syncUnread,
	updatePreferences,
} from "../../lib/notifications";

type Variables = {
	user: User | null;
	session: unknown;
};

const notificationRoutes = new Hono<{ Variables: Variables }>();

/** Keeps proxies from closing a stream that has nothing to send. */
const HEARTBEAT_MS = 25_000;

// The signed-in user's notifications, most recent first
notificationRoutes.get(
	"/",
	zValidator(
		"query",
		z.object({
			limit: z.coerce.number().int().min(1).max(50).default(20),
			page: z.coerce.number().int().min(1).default(1),
		}),
	),
	async (c) => {
		const viewer = c.get("user");
		if (!viewer) return c.json({ error: "Unauthorized" }, 401);
		const { limit, page } = c.req.valid("query");

		const filter = eq(notifications.recipientId, viewer.id);

		const [rows, [total]] = await Promise.all([
			db
				.select({
					id: notifications.id,
					type: notifications.type,
					readAt: notifications.readAt,
					createdAt: notifications.createdAt,
					actorId: users.id,
					actorName: users.name,
					actorDisplayName: users.displayName,
					actorAvatarUrl: users.avatarUrl,
					actorIsPrivate: users.isPrivate,
				})
				.from(notifications)
				.leftJoin(users, eq(notifications.actorId, users.id))
				.where(filter)
				.orderBy(desc(notifications.createdAt), desc(notifications.id))
				.limit(limit)
				.offset((page - 1) * limit),
			db.select({ count: count() }).from(notifications).where(filter),
		]);

		const relations = await getViewerRelations(
			viewer.id,
			rows.flatMap((row) => (row.actorId ? [row.actorId] : [])),
		);

		const data = rows.map((row) => ({
			id: row.id,
			type: row.type,
			createdAt: row.createdAt,
			read: row.readAt !== null,
			actor:
				row.actorId && row.actorName
					? {
							name: row.actorName,
							displayName: row.actorDisplayName,
							avatarUrl: row.actorAvatarUrl,
							isPrivate: row.actorIsPrivate,
							followStatus: relations.get(row.actorId)?.followStatus ?? null,
							followsYou: relations.get(row.actorId)?.followsYou ?? false,
						}
					: null,
		}));

		const totalResults = total?.count ?? 0;
		return c.json({
			data,
			page,
			total_pages: Math.ceil(totalResults / limit),
			total_results: totalResults,
		});
	},
);

notificationRoutes.get("/unread-count", async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	return c.json({ count: await countUnread(viewer.id) });
});

// Mark notifications as read: the given ones, or all of them
notificationRoutes.post(
	"/read",
	zValidator(
		"json",
		z.object({ ids: z.array(z.uuid()).min(1).max(100).optional() }),
	),
	async (c) => {
		const viewer = c.get("user");
		if (!viewer) return c.json({ error: "Unauthorized" }, 401);
		const { ids } = c.req.valid("json");

		const marked = await db
			.update(notifications)
			.set({ readAt: new Date() })
			.where(
				and(
					eq(notifications.recipientId, viewer.id),
					isNull(notifications.readAt),
					ids ? inArray(notifications.id, ids) : undefined,
				),
			)
			.returning({ id: notifications.id });

		// Other tabs and devices clear their badge too.
		if (marked.length > 0) await syncUnread([viewer.id], "read");

		return c.body(null, 204);
	},
);

// Delete all of the signed-in user's notifications
notificationRoutes.delete("/", async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	const deleted = await db
		.delete(notifications)
		.where(eq(notifications.recipientId, viewer.id))
		.returning({ id: notifications.id });

	if (deleted.length > 0) await syncUnread([viewer.id], "removed");

	return c.body(null, 204);
});

// Delete one notification
notificationRoutes.delete(
	"/:id",
	zValidator("param", z.object({ id: z.uuid() })),
	async (c) => {
		const viewer = c.get("user");
		if (!viewer) return c.json({ error: "Unauthorized" }, 401);

		const [deleted] = await db
			.delete(notifications)
			.where(
				and(
					eq(notifications.id, c.req.valid("param").id),
					eq(notifications.recipientId, viewer.id),
				),
			)
			.returning({ id: notifications.id });

		if (!deleted) return c.json({ error: "NOTIFICATION_NOT_FOUND" }, 404);

		await syncUnread([viewer.id], "removed");

		return c.body(null, 204);
	},
);

notificationRoutes.get("/preferences", async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	return c.json(await getPreferences(viewer.id));
});

notificationRoutes.patch(
	"/preferences",
	zValidator("json", z.partialRecord(z.enum(notificationTypes), z.boolean())),
	async (c) => {
		const viewer = c.get("user");
		if (!viewer) return c.json({ error: "Unauthorized" }, 401);

		return c.json(await updatePreferences(viewer.id, c.req.valid("json")));
	},
);

// Server-sent events with the unread count: sent on connect, then whenever
// the signed-in user's notifications change.
notificationRoutes.get("/stream", async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	// Bun closes connections idle for 10 seconds by default.
	const server = c.env as
		| { timeout?: (request: Request, seconds: number) => void }
		| undefined;
	server?.timeout?.(c.req.raw, 0);

	return streamSSE(
		c,
		async (stream) => {
			const send = (event: NotificationEvent) =>
				stream.writeSSE({
					event: "notifications",
					data: JSON.stringify(event),
				});

			const stopListening = await listenToUser(viewer.id, (event) => {
				send(event).catch(() => {});
			});
			stream.onAbort(stopListening);

			await send({ reason: "init", unreadCount: await countUnread(viewer.id) });

			while (!stream.aborted && !stream.closed) {
				await stream.sleep(HEARTBEAT_MS);
				await stream.writeSSE({ event: "ping", data: "" });
			}

			stopListening();
		},
		async (error) => {
			logger.error(error, "Notification stream failed");
		},
	);
});

export default notificationRoutes;
