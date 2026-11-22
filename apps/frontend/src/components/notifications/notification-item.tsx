import { IconCheck, IconChevronDown, IconX } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type {
	NotificationActor,
	NotificationType,
	UserNotification,
} from "@/api/notifications";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { UserCard } from "@/components/profile/user-card";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import {
	useAcceptFollowRequest,
	useDeclineFollowRequest,
} from "@/hooks/useFollows";
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
	size,
}: {
	actor: NotificationActor;
	size?: "default" | "lg";
}) {
	return (
		<Avatar size={size}>
			<AvatarImage src={actor.avatarUrl ?? undefined} alt={actor.displayName} />
			<AvatarFallback>
				{actor.displayName.charAt(0).toUpperCase()}
			</AvatarFallback>
		</Avatar>
	);
}

function FollowRequestActions({
	actor,
	compact,
}: {
	actor: NotificationActor;
	compact: boolean;
}) {
	const accept = useAcceptFollowRequest();
	const decline = useDeclineFollowRequest();
	const pending = accept.isPending || decline.isPending;

	return (
		<>
			<Button
				size={compact ? "icon-sm" : "sm"}
				disabled={pending}
				onClick={() => accept.mutate(actor.name)}
				aria-label={
					compact ? m.dreamy_gray_tiger({ name: actor.displayName }) : undefined
				}
			>
				<IconCheck className="h-4 w-4" />
				{compact ? null : m.lively_khaki_rabbit()}
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
function FollowBackButton({
	actor,
	compact,
}: {
	actor: NotificationActor;
	compact: boolean;
}) {
	if (actor.followStatus === "accepted") return null;

	return (
		<ProfileFollowButton
			username={actor.name}
			displayName={actor.displayName}
			isPrivate={actor.isPrivate}
			followStatus={actor.followStatus}
			followsYou={actor.followsYou}
			iconOnly={compact}
		/>
	);
}

function NotificationActions({
	type,
	actor,
	compact,
}: {
	type: NotificationType;
	actor: NotificationActor;
	compact: boolean;
}) {
	if (type === "follow_request")
		return <FollowRequestActions actor={actor} compact={compact} />;
	if (type === "new_follower")
		return <FollowBackButton actor={actor} compact={compact} />;
	return null;
}

interface NotificationItemProps {
	notification: UserNotification;
	localeRegion: string;
	/** Icon-only actions, for narrow spaces like the popover. */
	compact?: boolean;
	onNavigate?: () => void;
}

export function NotificationItem({
	notification,
	localeRegion,
	compact = false,
	onNavigate,
}: NotificationItemProps) {
	const { actors, type } = notification;
	const [first, second] = actors;
	if (!first) return null;

	const groupMessage = groupText[type];
	const isGroup = !!second && !!groupMessage;

	const body: ReactNode = (
		<>
			<ItemMedia>
				{isGroup ? (
					<AvatarGroup>
						<ActorAvatar actor={first} />
						<ActorAvatar actor={second} />
					</AvatarGroup>
				) : (
					<ActorAvatar actor={first} size="lg" />
				)}
			</ItemMedia>
			<ItemContent className="min-w-0">
				<ItemTitle className="line-clamp-2 font-normal">
					{isGroup
						? groupMessage({
								first: first.displayName,
								second: second.displayName,
								count: notification.actorCount - 2,
							})
						: notificationText[type]({ name: first.displayName })}
				</ItemTitle>
				<ItemDescription className="text-xs">
					{formatDistanceToNow(new Date(notification.createdAt), localeRegion)}
				</ItemDescription>
			</ItemContent>
			{notification.read ? null : (
				<span
					className="size-2 shrink-0 rounded-full bg-primary"
					aria-hidden="true"
				/>
			)}
		</>
	);

	if (!isGroup) {
		return (
			<Item variant="outline" size="sm" className="hover:bg-muted/50">
				<Link
					to="/@{$username}"
					params={{ username: first.name }}
					onClick={onNavigate}
					className="flex min-w-0 flex-1 items-center gap-2.5"
				>
					{body}
				</Link>
				<ItemActions className="gap-1 empty:hidden">
					<NotificationActions type={type} actor={first} compact={compact} />
				</ItemActions>
			</Item>
		);
	}

	// The people of a group are listed below it, inside the same card.
	return (
		<Collapsible>
			<Item
				variant="outline"
				size="sm"
				className="hover:bg-muted/50 has-data-panel-open:hover:bg-transparent"
			>
				<CollapsibleTrigger className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left">
					{body}
					{/* Sized like an icon-sm button so it lines up with other items' actions. */}
					<span className="flex size-7 shrink-0 items-center justify-center">
						<IconChevronDown
							aria-hidden="true"
							className="size-4 text-muted-foreground transition-transform in-data-panel-open:rotate-180"
						/>
					</span>
				</CollapsibleTrigger>
				<CollapsibleContent className="ml-4 basis-full border-l pl-2">
					{actors.map((actor) => (
						<UserCard
							key={actor.name}
							user={{ ...actor, bio: null }}
							onNavigate={onNavigate}
							actions={
								type === "new_follower" ? (
									<FollowBackButton actor={actor} compact={compact} />
								) : null
							}
						/>
					))}
				</CollapsibleContent>
			</Item>
		</Collapsible>
	);
}
