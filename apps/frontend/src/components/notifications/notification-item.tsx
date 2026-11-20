import { IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type {
	NotificationActor,
	NotificationType,
	UserNotification,
} from "@/api/notifications";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	useAcceptFollowRequest,
	useDeclineFollowRequest,
} from "@/hooks/useFollows";
import { useDeleteNotification } from "@/hooks/useNotifications";
import { m } from "@/paraglide/messages";
import { formatDistanceToNow } from "@/utils/format-date";

const notificationText: Record<
	NotificationType,
	(params: { name: string }) => string
> = {
	new_follower: m.velvet_onyx_flute,
	follow_request: m.quiet_slate_clover,
	follow_request_accepted: m.eager_plum_violin,
};

function FollowRequestActions({ actor }: { actor: NotificationActor }) {
	const accept = useAcceptFollowRequest();
	const decline = useDeclineFollowRequest();
	const pending = accept.isPending || decline.isPending;

	return (
		<>
			<Button
				size="sm"
				disabled={pending}
				onClick={() => accept.mutate(actor.name)}
			>
				<IconCheck className="h-4 w-4" />
				{m.lively_khaki_rabbit()}
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				disabled={pending}
				onClick={() => decline.mutate(actor.name)}
				aria-label={m.plucky_green_beaver({ name: actor.displayName })}
			>
				<IconX />
			</Button>
		</>
	);
}

function NotificationActions({
	type,
	actor,
}: {
	type: NotificationType;
	actor: NotificationActor;
}) {
	if (type === "follow_request") return <FollowRequestActions actor={actor} />;

	// Offer to follow back until the viewer follows the new follower.
	if (type === "new_follower" && actor.followStatus !== "accepted") {
		return (
			<ProfileFollowButton
				username={actor.name}
				displayName={actor.displayName}
				isPrivate={actor.isPrivate}
				followStatus={actor.followStatus}
				followsYou={actor.followsYou}
			/>
		);
	}

	return null;
}

interface NotificationItemProps {
	notification: UserNotification;
	localeRegion: string;
	onNavigate?: () => void;
}

export function NotificationItem({
	notification,
	localeRegion,
	onNavigate,
}: NotificationItemProps) {
	const deleteNotification = useDeleteNotification();
	const { actor, type } = notification;
	if (!actor) return null;

	return (
		<div className="group flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
			<Link
				to="/@{$username}"
				params={{ username: actor.name }}
				onClick={onNavigate}
				className="flex min-w-0 flex-1 items-center gap-3"
			>
				<Avatar className="h-10 w-10 shrink-0 rounded-full">
					<AvatarImage
						src={actor.avatarUrl ?? undefined}
						alt={actor.displayName}
					/>
					<AvatarFallback className="rounded-full">
						{actor.displayName.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<p className="line-clamp-2 text-sm">
						{notificationText[type]({ name: actor.displayName })}
					</p>
					<p className="text-xs text-muted-foreground">
						{formatDistanceToNow(
							new Date(notification.createdAt),
							localeRegion,
						)}
					</p>
				</div>
				{notification.read ? null : (
					<span
						className="h-2 w-2 shrink-0 rounded-full bg-primary"
						aria-hidden="true"
					/>
				)}
			</Link>
			<div className="flex shrink-0 items-center gap-1">
				<NotificationActions type={type} actor={actor} />
				{/* Only revealed on hover where hovering exists, always shown on touch. */}
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => deleteNotification.mutate(notification.id)}
					aria-label={m.lucky_sepia_blossom()}
					className="text-muted-foreground focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:hover)]:opacity-0"
				>
					<IconTrash />
				</Button>
			</div>
		</div>
	);
}
