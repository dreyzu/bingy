import { and, eq, notExists, or, type SQL } from "drizzle-orm";
import type { Context } from "hono";
import {
	blocks,
	type FollowStatus,
	follows,
	type User,
	users,
} from "../db/schemas";
import { db } from "./database";

type Viewer = Pick<User, "id"> | null | undefined;

export type ProfileAccess = {
	isOwner: boolean;
	canView: boolean;
	/** Status of the viewer's follow towards the profile owner, if any. */
	followStatus: FollowStatus | null;
	/** The viewer blocked the profile owner. */
	blocked: boolean;
	/** The profile owner blocked the viewer. */
	blocksYou: boolean;
};

export async function getFollowStatus(
	followerId: string,
	followingId: string,
): Promise<FollowStatus | null> {
	const row = await db.query.follows.findFirst({
		where: and(
			eq(follows.followerId, followerId),
			eq(follows.followingId, followingId),
		),
		columns: { status: true },
	});
	return row?.status ?? null;
}

/** A user id, or the `users.id` column to compare against the current row. */
type UserRef = string | typeof users.id;

const blockBetween = (userA: UserRef, userB: UserRef) =>
	or(
		and(eq(blocks.blockerId, userA), eq(blocks.blockedId, userB)),
		and(eq(blocks.blockerId, userB), eq(blocks.blockedId, userA)),
	);

/** Which of the two users blocked the other, if any. */
export async function getBlockState(viewerId: string, targetId: string) {
	const rows = await db
		.select({ blockerId: blocks.blockerId })
		.from(blocks)
		.where(blockBetween(viewerId, targetId));

	return {
		blocked: rows.some((row) => row.blockerId === viewerId),
		blocksYou: rows.some((row) => row.blockerId === targetId),
	};
}

export async function hasBlockBetween(userA: string, userB: string) {
	const [row] = await db
		.select({ blockerId: blocks.blockerId })
		.from(blocks)
		.where(blockBetween(userA, userB))
		.limit(1);
	return !!row;
}

/**
 * Filter for queries selecting from `users`: drops the users who blocked the
 * viewer or were blocked by them. No filter for signed-out viewers.
 */
export function notBlockedWith(viewerId: string | undefined): SQL | undefined {
	if (!viewerId) return undefined;
	return notExists(
		db
			.select({ blockerId: blocks.blockerId })
			.from(blocks)
			.where(blockBetween(viewerId, users.id)),
	);
}

/**
 * Who can see a profile's content (history, lists, watchlist, favorites…):
 * - the owner,
 * - nobody on either side of a block,
 * - anyone when the account is public,
 * - accepted followers when the account is private.
 */
export async function getProfileAccess(
	viewer: Viewer,
	target: Pick<User, "id" | "isPrivate">,
): Promise<ProfileAccess> {
	const isOwner = viewer?.id === target.id;
	if (isOwner) {
		return {
			isOwner,
			canView: true,
			followStatus: null,
			blocked: false,
			blocksYou: false,
		};
	}

	if (!viewer) {
		return {
			isOwner,
			canView: !target.isPrivate,
			followStatus: null,
			blocked: false,
			blocksYou: false,
		};
	}

	const [followStatus, { blocked, blocksYou }] = await Promise.all([
		getFollowStatus(viewer.id, target.id),
		getBlockState(viewer.id, target.id),
	]);
	const canView =
		!blocked &&
		!blocksYou &&
		(!target.isPrivate || followStatus === "accepted");

	return { isOwner, canView, followStatus, blocked, blocksYou };
}

type ViewableProfileResult =
	| { ok: true; user: User; access: ProfileAccess }
	| {
			ok: false;
			error: "USER_NOT_FOUND" | "PRIVATE_PROFILE" | "BLOCKED";
			status: 404 | 403;
	  };

/**
 * Loads a user by username and checks that the current viewer may see their
 * profile content. Routes should return the error as-is when `ok` is false.
 */
export async function loadViewableProfile(
	c: Context,
	username: string,
): Promise<ViewableProfileResult> {
	const user = await db.query.users.findFirst({
		where: eq(users.name, username.toLowerCase()),
	});

	if (!user) return { ok: false, error: "USER_NOT_FOUND", status: 404 };

	const access = await getProfileAccess(c.get("user"), user);
	if (!access.canView) {
		const error =
			access.blocked || access.blocksYou ? "BLOCKED" : "PRIVATE_PROFILE";
		return { ok: false, error, status: 403 };
	}

	return { ok: true, user, access };
}
