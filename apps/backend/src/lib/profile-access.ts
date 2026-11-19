import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { type FollowStatus, follows, type User, users } from "../db/schemas";
import { db } from "./database";

type Viewer = Pick<User, "id"> | null | undefined;

export type ProfileAccess = {
	isOwner: boolean;
	canView: boolean;
	/** Status of the viewer's follow towards the profile owner, if any. */
	followStatus: FollowStatus | null;
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

/**
 * Who can see a profile's content (history, lists, watchlist, favorites…):
 * - the owner,
 * - anyone when the account is public,
 * - accepted followers when the account is private.
 */
export async function getProfileAccess(
	viewer: Viewer,
	target: Pick<User, "id" | "isPrivate">,
): Promise<ProfileAccess> {
	const isOwner = viewer?.id === target.id;
	if (isOwner) return { isOwner, canView: true, followStatus: null };

	const followStatus = viewer
		? await getFollowStatus(viewer.id, target.id)
		: null;
	const canView = !target.isPrivate || followStatus === "accepted";

	return { isOwner, canView, followStatus };
}

type ViewableProfileResult =
	| { ok: true; user: User; access: ProfileAccess }
	| {
			ok: false;
			error: "USER_NOT_FOUND" | "PRIVATE_PROFILE";
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
		return { ok: false, error: "PRIVATE_PROFILE", status: 403 };
	}

	return { ok: true, user, access };
}
