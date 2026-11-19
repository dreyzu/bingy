import { IconLock } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { UserSummary } from "@/api/follows";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserCardProps {
	user: UserSummary;
	/** Buttons shown on the right of the row. */
	actions?: ReactNode;
	onNavigate?: () => void;
}

export function UserCard({ user, actions, onNavigate }: UserCardProps) {
	return (
		<div className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
			<Link
				to="/@{$username}"
				params={{ username: user.name }}
				onClick={onNavigate}
				className="flex flex-1 min-w-0 items-center gap-3"
			>
				<Avatar className="h-10 w-10 rounded-full">
					<AvatarImage
						src={user.avatarUrl ?? undefined}
						alt={user.displayName}
					/>
					<AvatarFallback className="rounded-full">
						{user.displayName.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<p className="flex items-center gap-1 text-sm font-medium">
						<span className="truncate">{user.displayName}</span>
						{user.isPrivate ? (
							<IconLock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						) : null}
					</p>
					<p className="text-xs text-muted-foreground truncate">
						{user.bio?.trim() || `@${user.name}`}
					</p>
				</div>
			</Link>
			{actions ? (
				<div className="flex shrink-0 items-center gap-1">{actions}</div>
			) : null}
		</div>
	);
}
