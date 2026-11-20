import { IconBell, IconLoader } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Popover,
	PopoverContent,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	notificationKeys,
	useMarkAllNotificationsRead,
	useNotifications,
	useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { localeRegionAtom } from "@/lib/atoms/region";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

interface NotificationListProps {
	unreadCount: number;
	onNavigate: () => void;
}

function NotificationList({ unreadCount, onNavigate }: NotificationListProps) {
	const localeRegion = useAtomValue(localeRegionAtom);
	const query = useNotifications(true);
	const { mutate: markAllRead } = useMarkAllNotificationsRead();
	const { data, status, hasNextPage, isFetchingNextPage, fetchNextPage } =
		query;

	// Mark everything read once the list shows it, so the unread dots of this
	// opening stay visible. Also covers notifications arriving while open.
	const settled = status === "success" && !query.isFetching;
	useEffect(() => {
		if (settled && unreadCount > 0) markAllRead();
	}, [settled, unreadCount, markAllRead]);

	if (status === "pending") {
		return (
			<div className="flex justify-center py-8">
				<IconLoader className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (status === "error") {
		return (
			<p className="py-8 text-center text-sm">{m.epic_sienna_penguin()}</p>
		);
	}

	const notifications = data.pages.flatMap((page) => page.data);

	if (notifications.length === 0) {
		return (
			<Empty className="py-8">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<IconBell />
					</EmptyMedia>
					<EmptyTitle>{m.gallant_emerald_jaguar()}</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);
	}

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
		if (
			scrollHeight - scrollTop - clientHeight < 100 &&
			hasNextPage &&
			!isFetchingNextPage
		) {
			fetchNextPage();
		}
	};

	return (
		<div
			onScroll={handleScroll}
			className="no-scrollbar max-h-[60vh] overflow-y-auto"
		>
			{notifications.map((notification) => (
				<NotificationItem
					key={notification.id}
					notification={notification}
					localeRegion={localeRegion}
					onNavigate={onNavigate}
				/>
			))}
			{isFetchingNextPage ? (
				<div className="flex justify-center py-2">
					<IconLoader className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			) : null}
		</div>
	);
}

/** Bell with the unread count, opening the signed-in user's notifications. */
export function NotificationBell({ className }: { className?: string }) {
	const { authData } = useRouteContext({ from: "__root__" });
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const { data } = useUnreadNotificationCount(!!authData);

	if (!authData) return null;
	const unreadCount = data?.count ?? 0;

	const onOpenChange = (next: boolean) => {
		setOpen(next);
		// Read state is only refreshed once closed (see NotificationList).
		if (!next) {
			queryClient.invalidateQueries({ queryKey: notificationKeys.list });
		}
	};

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						aria-label={m.dapper_topaz_jaguar()}
						className={cn("relative", className)}
					>
						<IconBell />
						{unreadCount > 0 ? (
							<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						) : null}
					</Button>
				}
			/>
			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-[min(24rem,calc(100vw-2rem))] gap-1"
			>
				<PopoverTitle className="px-2 pt-1 text-base">
					{m.fierce_ivory_hazel()}
				</PopoverTitle>
				<NotificationList
					unreadCount={unreadCount}
					onNavigate={() => onOpenChange(false)}
				/>
			</PopoverContent>
		</Popover>
	);
}
