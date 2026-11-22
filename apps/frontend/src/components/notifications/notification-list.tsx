import { IconBell, IconLoader } from "@tabler/icons-react";
import { cn } from "cn";
import { useAtomValue } from "jotai";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup } from "@/components/ui/item";
import {
	useClearNotifications,
	useMarkAllNotificationsRead,
	useNotifications,
	useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";

interface NotificationsHeaderProps {
	title: ReactNode;
	canClear: boolean;
}

/** Title with a "Clear all" action that asks for confirmation. */
function NotificationsHeader({ title, canClear }: NotificationsHeaderProps) {
	const [confirming, setConfirming] = useState(false);
	const clear = useClearNotifications();

	return (
		<div className="flex min-h-8 items-center justify-between gap-2">
			{title}
			{canClear ? (
				<Dialog open={confirming} onOpenChange={setConfirming}>
					<DialogTrigger
						render={
							<Button variant="outline" size="sm">
								{m.frosty_amber_seal()}
							</Button>
						}
					/>
					<DialogContent
						showCloseButton={false}
						className="max-w-xs sm:max-w-sm"
					>
						<DialogHeader>
							<DialogTitle>{m.bright_hazel_nectar()}</DialogTitle>
							<DialogDescription>
								{m.rapid_periwinkle_canyon()}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose render={<Button variant="outline" />}>
								{m.dusky_wine_biscuit()}
							</DialogClose>
							<Button
								variant="destructive"
								onClick={() => {
									clear.mutate();
									setConfirming(false);
								}}
							>
								{m.balmy_topaz_coral()}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			) : null}
		</div>
	);
}

interface NotificationListProps {
	title: ReactNode;
	/** Scroll inside the list (popover) instead of with the page. */
	scrollable?: boolean;
	/** Icon-only item actions, for narrow spaces like the popover. */
	compact?: boolean;
	onNavigate?: () => void;
}

/**
 * The signed-in user's notifications. Showing the list marks them read; the
 * unread dots of what was new stay until the list is closed.
 */
export function NotificationList({
	title,
	scrollable = false,
	compact = false,
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
					"mx-auto w-full max-w-2xl",
					scrollable && "no-scrollbar max-h-[70vh] overflow-y-auto",
				)}
			>
				<ItemGroup className="has-data-[size=sm]:gap-2">
					{notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							notification={notification}
							localeRegion={localeRegion}
							compact={compact}
							onNavigate={onNavigate}
						/>
					))}
				</ItemGroup>
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
