import { and, eq, inArray, or } from "drizzle-orm";
import { type FollowStatus, follows } from "../db/schemas";
import { db } from "./database";

export type ViewerRelation = {
	/** The viewer's follow towards the user. */
	followStatus: FollowStatus | null;
	/** Whether the user follows the viewer. */
	followsYou: boolean;
};

/**
 * The viewer's relationship with each of these users (follow status both
 * ways), so lists can render the right follow button without an extra
 * request per row. Users without any relationship are missing from the map.
 */
export async function getViewerRelations(
	viewerId: string | undefined,
	userIds: string[],
) {
	const relations = new Map<string, ViewerRelation>();
	if (!viewerId || userIds.length === 0) return relations;

	const rows = await db
		.select({
			followerId: follows.followerId,
			followingId: follows.followingId,
			status: follows.status,
		})
		.from(follows)
		.where(
			or(
				and(
					eq(follows.followerId, viewerId),
					inArray(follows.followingId, userIds),
				),
				and(
					eq(follows.followingId, viewerId),
					inArray(follows.followerId, userIds),
					eq(follows.status, "accepted"),
				),
			),
		);

	const get = (userId: string) => {
		let relation = relations.get(userId);
		if (!relation) {
			relation = { followStatus: null, followsYou: false };
			relations.set(userId, relation);
		}
		return relation;
	};

	for (const row of rows) {
		if (row.followerId === viewerId) {
			get(row.followingId).followStatus = row.status;
		} else {
			get(row.followerId).followsYou = true;
		}
	}

	return relations;
}
