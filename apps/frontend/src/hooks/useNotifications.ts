import {
	type InfiniteData,
	type QueryClient,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import {
	clearNotifications,
	deleteNotifications,
	fetchNotificationPreferences,
	fetchNotifications,
	fetchUnreadNotificationCount,
	markNotificationsRead,
	type NotificationEvent,
	type NotificationPreferences,
	type NotificationsResponse,
	notificationStreamUrl,
	type UserNotification,
	updateNotificationPreferences,
} from "@/api/notifications";
import { toast } from "@/components/toast/toast";
import { m } from "@/paraglide/messages";

export const notificationKeys = {
	all: ["notifications"],
	list: ["notifications", "list"],
	unreadCount: ["notifications", "unread-count"],
	preferences: ["notification-preferences"],
} as const;

const getNextPageParam = (lastPage: NotificationsResponse) =>
	lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;

export function useNotifications(enabled: boolean) {
	return useInfiniteQuery({
		queryKey: notificationKeys.list,
		queryFn: ({ pageParam }) => fetchNotifications(pageParam),
		initialPageParam: 1,
		getNextPageParam,
		enabled,
	});
}

export function useUnreadNotificationCount(enabled: boolean) {
	return useQuery({
		queryKey: notificationKeys.unreadCount,
		queryFn: fetchUnreadNotificationCount,
		enabled,
		// Kept up to date by the notification stream; refetching on focus
		// covers the time the stream was disconnected.
		staleTime: 1000 * 60,
		refetchOnWindowFocus: true,
	});
}

/** Refetches the list the next time it's shown, without touching an open one. */
const markListStale = (queryClient: QueryClient) =>
	queryClient.invalidateQueries({
		queryKey: notificationKeys.list,
		refetchType: "none",
	});

const MAX_RECONNECT_DELAY_MS = 30_000;

/**
 * Listens to the server's notification stream while signed in, so the badge
 * and the list update as soon as something happens.
 */
export function useNotificationStream(userId: string | undefined) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!userId) return;

		let source: EventSource | null = null;
		let retryTimer: ReturnType<typeof setTimeout> | undefined;
		let attempt = 0;

		const onEvent = (message: MessageEvent<string>) => {
			let event: NotificationEvent;
			try {
				event = JSON.parse(message.data);
			} catch {
				return;
			}

			queryClient.setQueryData(notificationKeys.unreadCount, {
				count: event.unreadCount,
			});

			// An open list keeps showing which notifications were new; it's
			// refetched the next time it's shown.
			if (event.reason === "read") {
				markListStale(queryClient);
				return;
			}
			queryClient.invalidateQueries({ queryKey: notificationKeys.list });
			queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
		};

		const connect = () => {
			clearTimeout(retryTimer);
			source?.close();

			const current = new EventSource(notificationStreamUrl, {
				withCredentials: true,
			});
			source = current;

			current.addEventListener("notifications", onEvent);
			current.addEventListener("open", () => {
				attempt = 0;
			});
			// The browser retries a dropped connection by itself, but gives up
			// for good after an error response (such as a 502 while the server
			// restarts). Retry with a growing, jittered delay in that case.
			current.addEventListener("error", () => {
				if (current.readyState !== EventSource.CLOSED) return;
				const delay = Math.min(MAX_RECONNECT_DELAY_MS, 1000 * 2 ** attempt);
				attempt++;
				retryTimer = setTimeout(connect, delay * (0.5 + Math.random() / 2));
			});
		};

		// Back online: don't wait for the next retry.
		const onOnline = () => {
			if (source?.readyState === EventSource.CLOSED) connect();
		};

		connect();
		window.addEventListener("online", onOnline);
		return () => {
			window.removeEventListener("online", onOnline);
			clearTimeout(retryTimer);
			source?.close();
		};
	}, [userId, queryClient]);
}

export function useMarkAllNotificationsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => markNotificationsRead(),
		onMutate: () => {
			queryClient.setQueryData(notificationKeys.unreadCount, { count: 0 });
		},
		// The open list keeps its unread dots until it's shown again.
		onSuccess: () => markListStale(queryClient),
		onError: () =>
			queryClient.invalidateQueries({
				queryKey: notificationKeys.unreadCount,
			}),
	});
}

type NotificationPages = InfiniteData<NotificationsResponse>;

/** Removes rows from the cached list right away; returns the previous list. */
async function removeFromList(
	queryClient: QueryClient,
	keep: (notification: UserNotification) => boolean,
) {
	await queryClient.cancelQueries({ queryKey: notificationKeys.list });
	const previous = queryClient.getQueryData<NotificationPages>(
		notificationKeys.list,
	);
	if (previous) {
		queryClient.setQueryData<NotificationPages>(notificationKeys.list, {
			...previous,
			pages: previous.pages.map((page) => ({
				...page,
				data: page.data.filter(keep),
			})),
		});
	}
	return previous;
}

export function useDeleteNotification() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (entry: UserNotification) => deleteNotifications(entry.ids),
		onMutate: async (entry: UserNotification) => ({
			previous: await removeFromList(
				queryClient,
				(notification) => notification.id !== entry.id,
			),
		}),
		onError: (_error, _entry, context) => {
			if (context?.previous) {
				queryClient.setQueryData(notificationKeys.list, context.previous);
			}
			toast.error({ title: m.humble_cerise_canyon() });
		},
	});
}

export function useClearNotifications() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: clearNotifications,
		onMutate: async () => {
			queryClient.setQueryData(notificationKeys.unreadCount, { count: 0 });
			return { previous: await removeFromList(queryClient, () => false) };
		},
		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(notificationKeys.list, context.previous);
			}
			queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
			toast.error({ title: m.eager_white_crystal() });
		},
	});
}

export function useNotificationPreferences() {
	return useQuery({
		queryKey: notificationKeys.preferences,
		queryFn: fetchNotificationPreferences,
	});
}

export function useUpdateNotificationPreferences() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateNotificationPreferences,
		onMutate: async (changes) => {
			await queryClient.cancelQueries({
				queryKey: notificationKeys.preferences,
			});
			const previous = queryClient.getQueryData<NotificationPreferences>(
				notificationKeys.preferences,
			);
			if (previous) {
				queryClient.setQueryData(notificationKeys.preferences, {
					...previous,
					...changes,
				});
			}
			return { previous };
		},
		onSuccess: (preferences) => {
			queryClient.setQueryData(notificationKeys.preferences, preferences);
		},
		onError: (_error, _changes, context) => {
			if (context?.previous) {
				queryClient.setQueryData(
					notificationKeys.preferences,
					context.previous,
				);
			}
			toast.error({ title: m.stellar_sienna_moose() });
		},
	});
}
