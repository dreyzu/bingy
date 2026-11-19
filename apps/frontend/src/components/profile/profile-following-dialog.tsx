import { useState } from "react";
import { FollowUsersList } from "@/components/profile/follow-users-list";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useFollowUsers } from "@/hooks/useFollows";
import { m } from "@/paraglide/messages";

interface ProfileFollowingDialogProps {
	username: string;
	displayName: string;
	count: number;
	isOwnProfile: boolean;
	/** False for a private profile the viewer does not follow. */
	canView: boolean;
}

export function ProfileFollowingDialog({
	username,
	displayName,
	count,
	isOwnProfile,
	canView,
}: ProfileFollowingDialogProps) {
	const [open, setOpen] = useState(false);
	const query = useFollowUsers(username, "following", open);

	const label = (
		<span className="font-semibold">
			{count} {m.steady_white_boulder()}
		</span>
	);

	if (!canView) return <span>{label}</span>;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button
						variant="link"
						className="flex h-auto flex-row items-center p-0"
					>
						{label}
					</Button>
				}
			/>
			<DialogContent className="max-w-xs md:max-w-lg">
				<DialogHeader>
					<DialogTitle>{m.noble_amber_yak()}</DialogTitle>
					<DialogDescription>
						{isOwnProfile
							? m.quiet_orange_lantern()
							: m.fierce_khaki_oasis({ name: displayName })}
					</DialogDescription>
				</DialogHeader>
				<FollowUsersList
					query={query}
					emptyMessage={m.alert_turquoise_hazel()}
					errorMessage={m.wise_topaz_barn()}
					onNavigate={() => setOpen(false)}
					renderActions={(user) =>
						user.isViewer ? null : (
							<ProfileFollowButton
								username={user.name}
								displayName={user.displayName}
								isPrivate={user.isPrivate}
								followStatus={user.followStatus}
								followsYou={user.followsYou}
							/>
						)
					}
				/>
			</DialogContent>
		</Dialog>
	);
}
