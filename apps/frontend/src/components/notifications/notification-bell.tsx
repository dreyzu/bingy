import { IconBell } from "@tabler/icons-react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { NotificationList } from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";

function UnreadBadge({ count }: { count: number }) {
	if (count === 0) return null;

	return (
		<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
			{count > 99 ? "99+" : count}
		</span>
	);
}

/** Bell with the unread count, for the mobile bottom navigation. */
export function NotificationNavIcon() {
	const { data } = useUnreadNotificationCount(true);

	return (
		<span className="relative flex">
			<IconBell className="h-6 w-6" />
			<UnreadBadge count={data?.count ?? 0} />
		</span>
	);
}

/** Bell with the unread count, opening the signed-in user's notifications. */
export function NotificationBell({ className }: { className?: string }) {
	const { authData } = useRouteContext({ from: "__root__" });
	const [open, setOpen] = useState(false);
	const { data } = useUnreadNotificationCount(!!authData);

	if (!authData) return null;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						aria-label={m.dapper_topaz_jaguar()}
						className={cn("relative", className)}
					>
						<IconBell />
						<UnreadBadge count={data?.count ?? 0} />
					</Button>
				}
			/>
			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-[min(24rem,calc(100vw-2rem))] gap-1"
			>
				<NotificationList
					scrollable
					title={
						<PopoverTitle className="text-base">
							{m.fierce_ivory_hazel()}
						</PopoverTitle>
					}
					onNavigate={() => setOpen(false)}
				/>
				<Link
					to="/notifications"
					onClick={() => setOpen(false)}
					className="rounded-md py-2 text-center text-sm font-medium hover:bg-muted/50"
				>
					{m.gentle_gray_violin()}
				</Link>
			</PopoverContent>
		</Popover>
	);
}
