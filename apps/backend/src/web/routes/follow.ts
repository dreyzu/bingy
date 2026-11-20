import { zValidator } from "@hono/zod-validator";
import { and, count, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { type FollowStatus, follows, type User, users } from "../../db/schemas";
import { db } from "../../lib/database";
import { getViewerRelations } from "../../lib/follow-relations";
import {
	notify,
	resolveFollowRequests,
	retract,
} from "../../lib/notifications";
import {
	hasBlockBetween,
	loadViewableProfile,
	notBlockedWith,
} from "../../lib/profile-access";

type Variables = {
	user: User | null;
	session: unknown;
};

const followRoutes = new Hono<{ Variables: Variables }>();

const paginationQuery = zValidator(
	"query",
	z.object({
		limit: z.coerce.number().int().min(1).max(50).default(20),
		page: z.coerce.number().int().min(1).default(1),
	}),
);

const usernameParam = zValidator("param", z.object({ username: z.string() }));

const userCardColumns = {
	id: users.id,
	name: users.name,
	displayName: users.displayName,
	avatarUrl: users.avatarUrl,
	bio: users.bio,
	isPrivate: users.isPrivate,
};

type UserCardRow = {
	id: string;
	name: string;
	displayName: string;
	avatarUrl: string | null;
	bio: string | null;
	isPrivate: boolean;
	followedAt: Date;
};

const findUserByName = (username: string) =>
	db.query.users.findFirst({
		where: eq(users.name, username.toLowerCase()),
	});

/** Adds the viewer's relationship with each user of the page. */
async function withViewerFollowStatus(
	viewerId: string | undefined,
	rows: UserCardRow[],
) {
	const relations = await getViewerRelations(
		viewerId,
		rows.map((row) => row.id),
	);

	return rows.map(({ id, ...row }) => ({
		...row,
		isViewer: id === viewerId,
		followStatus: relations.get(id)?.followStatus ?? null,
		followsYou: relations.get(id)?.followsYou ?? false,
	}));
}

function paginated<T>(data: T[], page: number, limit: number, total: number) {
	return {
		data,
		page,
		total_pages: Math.ceil(total / limit),
		total_results: total,
	};
}

// Incoming follow requests of the current user (private accounts)
followRoutes.get("/requests", paginationQuery, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);
	const { limit, page } = c.req.valid("query");

	const filters = and(
		eq(follows.followingId, viewer.id),
		eq(follows.status, "pending"),
	);

	const [rows, [total]] = await Promise.all([
		db
			.select({ ...userCardColumns, followedAt: follows.createdAt })
			.from(follows)
			.innerJoin(users, eq(follows.followerId, users.id))
			.where(filters)
			.orderBy(desc(follows.createdAt))
			.limit(limit)
			.offset((page - 1) * limit),
		db.select({ count: count() }).from(follows).where(filters),
	]);

	const data = await withViewerFollowStatus(viewer.id, rows);
	return c.json(paginated(data, page, limit, total?.count ?? 0));
});

// Follow requests the current user sent that are still waiting for an answer
followRoutes.get("/requests/sent", paginationQuery, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);
	const { limit, page } = c.req.valid("query");

	const filters = and(
		eq(follows.followerId, viewer.id),
		eq(follows.status, "pending"),
	);

	const [rows, [total]] = await Promise.all([
		db
			.select({ ...userCardColumns, followedAt: follows.createdAt })
			.from(follows)
			.innerJoin(users, eq(follows.followingId, users.id))
			.where(filters)
			.orderBy(desc(follows.createdAt))
			.limit(limit)
			.offset((page - 1) * limit),
		db.select({ count: count() }).from(follows).where(filters),
	]);

	const data = await withViewerFollowStatus(viewer.id, rows);
	return c.json(paginated(data, page, limit, total?.count ?? 0));
});

// Accept a follow request
followRoutes.post("/requests/:username/accept", usernameParam, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	const requester = await findUserByName(c.req.valid("param").username);
	if (!requester) return c.json({ error: "USER_NOT_FOUND" }, 404);

	const [accepted] = await db
		.update(follows)
		.set({ status: "accepted", acceptedAt: new Date() })
		.where(
			and(
				eq(follows.followerId, requester.id),
				eq(follows.followingId, viewer.id),
				eq(follows.status, "pending"),
			),
		)
		.returning({ status: follows.status });

	if (!accepted) return c.json({ error: "REQUEST_NOT_FOUND" }, 404);

	await Promise.all([
		resolveFollowRequests(viewer.id, [requester.id]),
		notify({
			recipientId: requester.id,
			actorId: viewer.id,
			type: "follow_request_accepted",
		}),
	]);

	return c.json({ status: accepted.status });
});

// Decline a follow request
followRoutes.delete("/requests/:username", usernameParam, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	const requester = await findUserByName(c.req.valid("param").username);
	if (!requester) return c.json({ error: "USER_NOT_FOUND" }, 404);

	await db
		.delete(follows)
		.where(
			and(
				eq(follows.followerId, requester.id),
				eq(follows.followingId, viewer.id),
				eq(follows.status, "pending"),
			),
		);

	await retract(viewer.id, requester.id, ["follow_request"]);

	return c.body(null, 204);
});

// Remove someone from the current user's followers
followRoutes.delete("/followers/:username", usernameParam, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	const follower = await findUserByName(c.req.valid("param").username);
	if (!follower) return c.json({ error: "USER_NOT_FOUND" }, 404);

	await db
		.delete(follows)
		.where(
			and(
				eq(follows.followerId, follower.id),
				eq(follows.followingId, viewer.id),
			),
		);

	await retract(viewer.id, follower.id, ["new_follower", "follow_request"]);

	return c.body(null, 204);
});

// Follow a user. Private accounts get a pending request instead.
followRoutes.post("/:username", usernameParam, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	const target = await findUserByName(c.req.valid("param").username);
	if (!target) return c.json({ error: "USER_NOT_FOUND" }, 404);
	if (target.id === viewer.id) {
		return c.json({ error: "CANNOT_FOLLOW_SELF" }, 400);
	}
	if (await hasBlockBetween(viewer.id, target.id)) {
		return c.json({ error: "BLOCKED" }, 403);
	}

	const status: FollowStatus = target.isPrivate ? "pending" : "accepted";

	const [created] = await db
		.insert(follows)
		.values({
			followerId: viewer.id,
			followingId: target.id,
			status,
			acceptedAt: status === "accepted" ? new Date() : null,
		})
		.onConflictDoNothing()
		.returning({ status: follows.status });

	if (created) {
		await notify({
			recipientId: target.id,
			actorId: viewer.id,
			type: created.status === "pending" ? "follow_request" : "new_follower",
		});
	}

	// Following again is a no-op: return whatever status already exists.
	const current = await db.query.follows.findFirst({
		where: and(
			eq(follows.followerId, viewer.id),
			eq(follows.followingId, target.id),
		),
		columns: { status: true },
	});

	return c.json({ status: current?.status ?? status });
});

// Unfollow a user, or cancel a pending request
followRoutes.delete("/:username", usernameParam, async (c) => {
	const viewer = c.get("user");
	if (!viewer) return c.json({ error: "Unauthorized" }, 401);

	const target = await findUserByName(c.req.valid("param").username);
	if (!target) return c.json({ error: "USER_NOT_FOUND" }, 404);

	await db
		.delete(follows)
		.where(
			and(
				eq(follows.followerId, viewer.id),
				eq(follows.followingId, target.id),
			),
		);

	await retract(target.id, viewer.id, ["new_follower", "follow_request"]);

	return c.body(null, 204);
});

// Accepted followers of a user
followRoutes.get(
	"/:username/followers",
	usernameParam,
	paginationQuery,
	async (c) => {
		const profile = await loadViewableProfile(c, c.req.valid("param").username);
		if (!profile.ok) {
			return c.json({ error: profile.error }, profile.status);
		}
		const { limit, page } = c.req.valid("query");

		const viewerId = c.get("user")?.id;
		const filters = and(
			eq(follows.followingId, profile.user.id),
			eq(follows.status, "accepted"),
			notBlockedWith(viewerId),
		);

		const [rows, [total]] = await Promise.all([
			db
				.select({ ...userCardColumns, followedAt: follows.createdAt })
				.from(follows)
				.innerJoin(users, eq(follows.followerId, users.id))
				.where(filters)
				.orderBy(desc(follows.createdAt))
				.limit(limit)
				.offset((page - 1) * limit),
			db
				.select({ count: count() })
				.from(follows)
				.innerJoin(users, eq(follows.followerId, users.id))
				.where(filters),
		]);

		const data = await withViewerFollowStatus(viewerId, rows);
		return c.json(paginated(data, page, limit, total?.count ?? 0));
	},
);

// Users a user follows (accepted only)
followRoutes.get(
	"/:username/following",
	usernameParam,
	paginationQuery,
	async (c) => {
		const profile = await loadViewableProfile(c, c.req.valid("param").username);
		if (!profile.ok) {
			return c.json({ error: profile.error }, profile.status);
		}
		const { limit, page } = c.req.valid("query");

		const viewerId = c.get("user")?.id;
		const filters = and(
			eq(follows.followerId, profile.user.id),
			eq(follows.status, "accepted"),
			notBlockedWith(viewerId),
		);

		const [rows, [total]] = await Promise.all([
			db
				.select({ ...userCardColumns, followedAt: follows.createdAt })
				.from(follows)
				.innerJoin(users, eq(follows.followingId, users.id))
				.where(filters)
				.orderBy(desc(follows.createdAt))
				.limit(limit)
				.offset((page - 1) * limit),
			db
				.select({ count: count() })
				.from(follows)
				.innerJoin(users, eq(follows.followingId, users.id))
				.where(filters),
		]);

		const data = await withViewerFollowStatus(viewerId, rows);
		return c.json(paginated(data, page, limit, total?.count ?? 0));
	},
);

export default followRoutes;
