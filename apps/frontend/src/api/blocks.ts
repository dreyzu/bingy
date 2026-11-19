import type { Pretty } from "shared";
import { apiFetch } from "./fetcher";
import type { PaginatedUsers, UserSummary } from "./follows";

export type BlockedUser = Pretty<UserSummary & { blockedAt: string }>;

export type BlockedUsersResponse = PaginatedUsers<BlockedUser>;

export const fetchBlockedUsers = (page = 1) =>
	apiFetch<BlockedUsersResponse>("/blocks", {
		method: "GET",
		query: { page },
	});

export const blockUser = (username: string) =>
	apiFetch<void>(`/blocks/${username}`, { method: "POST" });

export const unblockUser = (username: string) =>
	apiFetch<void>(`/blocks/${username}`, { method: "DELETE" });
