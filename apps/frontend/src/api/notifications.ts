import type { Pretty } from "shared";
import { config } from "@/lib/env";
import { apiFetch } from "./fetcher";
import type { FollowStatus, UserSummary } from "./follows";

export type NotificationType =
	| "new_follower"
	| "follow_request"
	| "follow_request_accepted";

export type NotificationActor = Pretty<
	Omit<UserSummary, "bio"> & {
		/** The signed-in user's follow towards the actor. */
		followStatus: FollowStatus | null;
		/** Whether the actor follows the signed-in user. */
		followsYou: boolean;
	}
>;

export type UserNotification = Pretty<{
	id: string;
	type: NotificationType;
	createdAt: string;
	read: boolean;
	actor: NotificationActor | null;
}>;

export type NotificationsResponse = Pretty<{
	data: UserNotification[];
	page: number;
	total_pages: number;
	total_results: number;
}>;

export type NotificationPreferences = Record<NotificationType, boolean>;

/** Why the server sent a new unread count on the notification stream. */
export type NotificationEvent = {
	reason: "init" | "created" | "removed" | "read" | "updated";
	unreadCount: number;
};

export const notificationStreamUrl = `${config.apiUrl}/api/notifications/stream`;

export const fetchNotifications = (page = 1) =>
	apiFetch<NotificationsResponse>("/notifications", {
		method: "GET",
		query: { page },
	});

export const fetchUnreadNotificationCount = () =>
	apiFetch<{ count: number }>("/notifications/unread-count", {
		method: "GET",
	});

/** Marks the given notifications as read, or all of them. */
export const markNotificationsRead = (ids?: string[]) =>
	apiFetch<void>("/notifications/read", {
		method: "POST",
		body: { ids },
	});

export const fetchNotificationPreferences = () =>
	apiFetch<NotificationPreferences>("/notifications/preferences", {
		method: "GET",
	});

export const updateNotificationPreferences = (
	changes: Partial<NotificationPreferences>,
) =>
	apiFetch<NotificationPreferences>("/notifications/preferences", {
		method: "PATCH",
		body: changes,
	});
