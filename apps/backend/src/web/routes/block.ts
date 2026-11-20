import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { blocks, follows, type User, users } from "../../db/schemas";
import { db } from "../../lib/database";
import {
	deleteNotificationsBetween,
	syncUnread,
} from "../../lib/notifications";

type Variables = {
	user: User | null;
	session: unknown;
};

const blockRoutes = new Hono<{ Variables: Variables }>();

const usernameParam = zValidator("param", z.object({ username: z.string() }));

const findUserByName = (username: string) =>
	db.query.users.findFirst({
		where: eq(users.name, username.toLowerCase()),
		columns: { id: true },
	});

// Accounts the current user blocked, most recent first
blockRoutes.get(
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

		const filter = eq(blocks.blockerId, viewer.id);

		const [data, [total]] = await Promise.all([
			db
				.select({
					name: users.name,
					displayName: users.displayName,
					avatarUrl: users.avatarUrl,
					bio: users.bio,
					isPrivate: users.isPrivate,
					blockedAt: blocks.createdAt,
				})
				.from(blocks)
				.innerJoin(users, eq(blocks.blockedId, users.id))
				.where(filter)
				.orderBy(desc(blocks.createdAt))
				.limit(limit)
				.offset((page - 1) * limit),
			db.select({ count: count() }).from(blocks).where(filter),
		]);

		const totalResults = total?.count ?? 0;
		return c.json({
			data,
			page,
			total_pages: Math.ceil(totalResults / limit),
			total_results: totalResults,
		});
	},
);

// Block a user. Removes every follow, follow request and notification between
// the two.
blockRoutes.post("/:username", usernameParam, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	const target = await findUserByName(c.req.valid("param").username);
	if (!target) return c.json({ error: "USER_NOT_FOUND" }, 404);
	if (target.id === viewer.id) {
		return c.json({ error: "CANNOT_BLOCK_SELF" }, 400);
	}

	await db.transaction(async (tx) => {
		await tx
			.insert(blocks)
			.values({ blockerId: viewer.id, blockedId: target.id })
			.onConflictDoNothing();

		await tx
			.delete(follows)
			.where(
				or(
					and(
						eq(follows.followerId, viewer.id),
						eq(follows.followingId, target.id),
					),
					and(
						eq(follows.followerId, target.id),
						eq(follows.followingId, viewer.id),
					),
				),
			);

		await deleteNotificationsBetween(tx, viewer.id, target.id);
	});

	await syncUnread([viewer.id, target.id], "removed");

	return c.body(null, 204);
});

// Unblock a user. Follows removed by the block are not restored.
blockRoutes.delete("/:username", usernameParam, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	const target = await findUserByName(c.req.valid("param").username);
	if (!target) return c.json({ error: "USER_NOT_FOUND" }, 404);

	await db
		.delete(blocks)
		.where(
			and(eq(blocks.blockerId, viewer.id), eq(blocks.blockedId, target.id)),
		);

	return c.body(null, 204);
});

export default blockRoutes;
