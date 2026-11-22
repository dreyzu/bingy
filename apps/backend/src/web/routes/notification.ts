import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray, isNull } from "drizzle-orm";
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
	listNotificationEntries,
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

const isTimeZone = (timeZone: string) => {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone });
		return true;
	} catch {
		return false;
	}
};

// The signed-in user's notifications, most recent first. On a given day
// (in the viewer's time zone), more than GROUP_THRESHOLD notifications of a
// groupable type are returned as one entry.
notificationRoutes.get(
	"/",
	zValidator(
		"query",
		z.object({
			limit: z.coerce.number().int().min(1).max(50).default(20),
			page: z.coerce.number().int().min(1).default(1),
			tz: z.string().max(64).refine(isTimeZone).default("UTC"),
		}),
	),
	async (c) => {
		const viewer = c.get("user");
		if (!viewer) return c.json({ error: "Unauthorized" }, 401);
		const { limit, page, tz } = c.req.valid("query");

		const { entries, total } = await listNotificationEntries(viewer.id, {
			timeZone: tz,
			limit,
			offset: (page - 1) * limit,
		});

		const actorIds = [...new Set(entries.flatMap((entry) => entry.actorIds))];
		const [actorRows, relations] = await Promise.all([
			actorIds.length > 0
				? db
						.select({
							id: users.id,
							name: users.name,
							displayName: users.displayName,
							avatarUrl: users.avatarUrl,
							isPrivate: users.isPrivate,
						})
						.from(users)
						.where(inArray(users.id, actorIds))
				: [],
			getViewerRelations(viewer.id, actorIds),
		]);
		const actorsById = new Map(
			actorRows.map(({ id, ...actor }) => [
				id,
				{
					...actor,
					followStatus: relations.get(id)?.followStatus ?? null,
					followsYou: relations.get(id)?.followsYou ?? false,
				},
			]),
		);

		const data = entries.map(({ actorIds, ...entry }) => ({
			...entry,
			actors: actorIds.flatMap((id) => {
				const actor = actorsById.get(id);
				return actor ? [actor] : [];
			}),
		}));

		return c.json({
			data,
			page,
			total_pages: Math.ceil(total / limit),
			total_results: total,
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

	const response = streamSSE(
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

	// Keep proxies (Cloudflare, nginx) from compressing or buffering events.
	response.headers.set("Cache-Control", "no-cache, no-transform");
	response.headers.set("X-Accel-Buffering", "no");
	return response;
});

export default notificationRoutes;
