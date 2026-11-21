import { IconBell, IconLoader } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	useClearNotifications,
	useMarkAllNotificationsRead,
	useNotifications,
	useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { localeRegionAtom } from "@/lib/atoms/region";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

interface NotificationsHeaderProps {
	title: ReactNode;
	canClear: boolean;
}

/** Title with a "Clear all" action that asks for confirmation in place. */
function NotificationsHeader({ title, canClear }: NotificationsHeaderProps) {
	const [confirming, setConfirming] = useState(false);
	const clear = useClearNotifications();

	if (confirming && canClear) {
		return (
			<div className="flex min-h-8 items-center justify-between gap-2">
				<p className="text-sm font-medium">{m.bright_hazel_nectar()}</p>
				<div className="flex shrink-0 items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setConfirming(false)}
					>
						{m.dusky_wine_biscuit()}
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => {
							clear.mutate();
							setConfirming(false);
						}}
					>
						{m.balmy_topaz_coral()}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-8 items-center justify-between gap-2">
			{title}
			{canClear ? (
				<Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
					{m.frosty_amber_seal()}
				</Button>
			) : null}
		</div>
	);
}

interface NotificationListProps {
	title: ReactNode;
	/** Scroll inside the list (popover) instead of with the page. */
	scrollable?: boolean;
	onNavigate?: () => void;
}

/**
 * The signed-in user's notifications. Showing the list marks them read; the
 * unread dots of what was new stay until the list is closed.
 */
export function NotificationList({
	title,
	scrollable = false,
	onNavigate,
}: NotificationListProps) {
	const localeRegion = useAtomValue(localeRegionAtom);
	const query = useNotifications(true);
	const { data: unread } = useUnreadNotificationCount(true);
	const { mutate: markAllRead } = useMarkAllNotificationsRead();
	const { data, status, hasNextPage, isFetchingNextPage, fetchNextPage } =
		query;
	const unreadCount = unread?.count ?? 0;

	// Once the list shows them, so new notifications keep their dot this time.
	// Also covers notifications arriving while the list is open.
	const settled = status === "success" && !query.isFetching;
	useEffect(() => {
		if (settled && unreadCount > 0) markAllRead();
	}, [settled, unreadCount, markAllRead]);

	// Loads the next page when the end of the list gets close. Observed
	// rather than read from a scroll event: the popover scrolls the list, but
	// the page scrolls the window.
	const loadMoreRef = useCallback(
		(element: HTMLDivElement) => {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry?.isIntersecting) fetchNextPage();
				},
				{ rootMargin: "200px" },
			);
			observer.observe(element);
			return () => observer.disconnect();
		},
		[fetchNextPage],
	);

	const notifications = data?.pages.flatMap((page) => page.data) ?? [];

	let content: ReactNode;
	if (status === "pending") {
		content = (
			<div className="flex justify-center py-8">
				<IconLoader className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	} else if (status === "error") {
		content = (
			<p className="py-8 text-center text-sm">{m.epic_sienna_penguin()}</p>
		);
	} else if (notifications.length === 0) {
		content = (
			<Empty className="py-8">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<IconBell />
					</EmptyMedia>
					<EmptyTitle>{m.gallant_emerald_jaguar()}</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);
	} else {
		content = (
			<div
				className={cn(
					// The padding keeps the scroll container from clipping the rings.
					"mx-auto flex w-full max-w-2xl flex-col gap-2 p-px",
					scrollable && "no-scrollbar max-h-[60vh] overflow-y-auto",
				)}
			>
				{notifications.map((notification) => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						localeRegion={localeRegion}
						onNavigate={onNavigate}
					/>
				))}
				{hasNextPage && !isFetchingNextPage ? <div ref={loadMoreRef} /> : null}
				{isFetchingNextPage ? (
					<div className="flex justify-center py-2">
						<IconLoader className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : null}
			</div>
		);
	}

	return (
		<>
			<NotificationsHeader title={title} canClear={notifications.length > 0} />
			{content}
		</>
	);
}
