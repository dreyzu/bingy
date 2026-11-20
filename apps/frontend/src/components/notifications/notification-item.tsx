import {
	IconCheck,
	IconChevronDown,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import type {
	NotificationActor,
	NotificationType,
	UserNotification,
} from "@/api/notifications";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { UserCard } from "@/components/profile/user-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	useAcceptFollowRequest,
	useDeclineFollowRequest,
} from "@/hooks/useFollows";
import { useDeleteNotification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
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

/** Only these types are grouped by the server. */
const groupText: Partial<
	Record<
		NotificationType,
		(params: { first: string; second: string; count: number }) => string
	>
> = {
	new_follower: m.icy_coral_moose,
	follow_request_accepted: m.hardy_azure_tiger,
};

function ActorAvatar({
	actor,
	className,
}: {
	actor: NotificationActor;
	className?: string;
}) {
	return (
		<Avatar className={cn("h-10 w-10 shrink-0 rounded-full", className)}>
			<AvatarImage src={actor.avatarUrl ?? undefined} alt={actor.displayName} />
			<AvatarFallback className="rounded-full">
				{actor.displayName.charAt(0).toUpperCase()}
			</AvatarFallback>
		</Avatar>
	);
}

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

/** "Follow back" until the viewer follows this new follower. */
function FollowBackButton({ actor }: { actor: NotificationActor }) {
	if (actor.followStatus === "accepted") return null;

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

function NotificationActions({
	type,
	actor,
}: {
	type: NotificationType;
	actor: NotificationActor;
}) {
	if (type === "follow_request") return <FollowRequestActions actor={actor} />;
	if (type === "new_follower") return <FollowBackButton actor={actor} />;
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
	const [expanded, setExpanded] = useState(false);
	const { actors, type } = notification;
	const [first, second] = actors;
	if (!first) return null;

	const groupMessage = groupText[type];
	const isGroup = !!second && !!groupMessage;

	const body: ReactNode = (
		<>
			{isGroup ? (
				<div className="relative h-10 w-10 shrink-0">
					<ActorAvatar
						actor={first}
						className="absolute top-0 left-0 h-7 w-7"
					/>
					<ActorAvatar
						actor={second}
						className="absolute right-0 bottom-0 h-7 w-7 ring-2 ring-popover"
					/>
				</div>
			) : (
				<ActorAvatar actor={first} />
			)}
			<div className="min-w-0 flex-1">
				<p className="line-clamp-2 text-sm">
					{isGroup
						? groupMessage({
								first: first.displayName,
								second: second.displayName,
								count: notification.actorCount - 2,
							})
						: notificationText[type]({ name: first.displayName })}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatDistanceToNow(new Date(notification.createdAt), localeRegion)}
				</p>
			</div>
			{notification.read ? null : (
				<span
					className="h-2 w-2 shrink-0 rounded-full bg-primary"
					aria-hidden="true"
				/>
			)}
		</>
	);

	return (
		<div>
			<div className="group flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
				{isGroup ? (
					<button
						type="button"
						aria-expanded={expanded}
						onClick={() => setExpanded((value) => !value)}
						className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
					>
						{body}
						<IconChevronDown
							aria-hidden="true"
							className={cn(
								"h-4 w-4 shrink-0 text-muted-foreground transition-transform",
								expanded && "rotate-180",
							)}
						/>
					</button>
				) : (
					<Link
						to="/@{$username}"
						params={{ username: first.name }}
						onClick={onNavigate}
						className="flex min-w-0 flex-1 items-center gap-3"
					>
						{body}
					</Link>
				)}
				<div className="flex shrink-0 items-center gap-1">
					{isGroup ? null : <NotificationActions type={type} actor={first} />}
					{/* Only revealed on hover where hovering exists, always shown on touch. */}
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => deleteNotification.mutate(notification)}
						aria-label={m.lucky_sepia_blossom()}
						className="text-muted-foreground focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:hover)]:opacity-0"
					>
						<IconTrash />
					</Button>
				</div>
			</div>
			{isGroup && expanded ? (
				<div className="ml-7 border-l pl-2">
					{actors.map((actor) => (
						<UserCard
							key={actor.name}
							user={{ ...actor, bio: null }}
							onNavigate={onNavigate}
							actions={
								type === "new_follower" ? (
									<FollowBackButton actor={actor} />
								) : null
							}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}
