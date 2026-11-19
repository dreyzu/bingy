import type { Pretty } from "shared";
import { apiFetch } from "./fetcher";

export type FollowStatus = "pending" | "accepted";

/** What a user row shows: enough to render a card that links to the profile. */
export type UserSummary = Pretty<{
	name: string;
	displayName: string;
	avatarUrl: string | null;
	bio: string | null;
	isPrivate: boolean;
}>;

export type FollowUser = Pretty<
	UserSummary & {
		followedAt: string;
		/** True when this row is the signed-in user. */
		isViewer: boolean;
		/** The signed-in user's follow towards this row. */
		followStatus: FollowStatus | null;
		/** Whether this row follows the signed-in user. */
		followsYou: boolean;
	}
>;

export type PaginatedUsers<T extends UserSummary> = Pretty<{
	data: T[];
	page: number;
	total_pages: number;
	total_results: number;
}>;

export type FollowUsersResponse = PaginatedUsers<FollowUser>;

export type FollowListKind = "followers" | "following";

export const followUser = (username: string) =>
	apiFetch<{ status: FollowStatus }>(`/follows/${username}`, {
		method: "POST",
	});

export const unfollowUser = (username: string) =>
	apiFetch<void>(`/follows/${username}`, { method: "DELETE" });

export const fetchFollowUsers = (
	username: string,
	kind: FollowListKind,
	page = 1,
) =>
	apiFetch<FollowUsersResponse>(`/follows/${username}/${kind}`, {
		method: "GET",
		query: { page },
	});

export const fetchFollowRequests = (page = 1) =>
	apiFetch<FollowUsersResponse>("/follows/requests", {
		method: "GET",
		query: { page },
	});

export const acceptFollowRequest = (username: string) =>
	apiFetch<{ status: FollowStatus }>(`/follows/requests/${username}/accept`, {
		method: "POST",
	});

export const declineFollowRequest = (username: string) =>
	apiFetch<void>(`/follows/requests/${username}`, { method: "DELETE" });

export const removeFollower = (username: string) =>
	apiFetch<void>(`/follows/followers/${username}`, { method: "DELETE" });

export const updatePrivacy = (isPrivate: boolean) =>
	apiFetch<{ isPrivate: boolean }>("/user/privacy", {
		method: "PATCH",
		body: { isPrivate },
	});
