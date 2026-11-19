import { useState } from "react";
import { FollowUsersList } from "@/components/profile/follow-users-list";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { RemoveFollowerButton } from "@/components/profile/remove-follower-button";
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

interface ProfileFollowersDialogProps {
	username: string;
	displayName: string;
	count: number;
	isOwnProfile: boolean;
	/** False for a private profile the viewer does not follow. */
	canView: boolean;
}

export function ProfileFollowersDialog({
	username,
	displayName,
	count,
	isOwnProfile,
	canView,
}: ProfileFollowersDialogProps) {
	const [open, setOpen] = useState(false);
	const query = useFollowUsers(username, "followers", open);

	const label = (
		<span className="font-semibold">
			{count} {m.grand_purple_zebra()}
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
					<DialogTitle>{m.loyal_ivory_seal()}</DialogTitle>
					<DialogDescription>
						{isOwnProfile
							? m.earthy_hazel_bagel()
							: m.golden_periwinkle_moose({ name: displayName })}
					</DialogDescription>
				</DialogHeader>
				<FollowUsersList
					query={query}
					emptyMessage={m.modest_gray_beaver()}
					errorMessage={m.cozy_onyx_violin()}
					onNavigate={() => setOpen(false)}
					renderActions={(user) =>
						user.isViewer ? null : (
							<>
								<ProfileFollowButton
									username={user.name}
									displayName={user.displayName}
									isPrivate={user.isPrivate}
									followStatus={user.followStatus}
									followsYou={user.followsYou}
								/>
								{isOwnProfile ? (
									<RemoveFollowerButton
										ownUsername={username}
										username={user.name}
										displayName={user.displayName}
									/>
								) : null}
							</>
						)
					}
				/>
			</DialogContent>
		</Dialog>
	);
}
