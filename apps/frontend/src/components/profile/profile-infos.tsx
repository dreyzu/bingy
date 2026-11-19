import { IconEdit, IconLocation, IconLock } from "@tabler/icons-react";
import { useRouteContext } from "@tanstack/react-router";
import type { UserProfileInfoResponse } from "@/api/user-profile";
import { ProfileActionsMenu } from "@/components/profile/profile-actions-menu";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { ProfileFollowStats } from "@/components/profile/profile-follow-stats";
import { ProfilePictureDialog } from "@/components/profile/profile-picture-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUnblockUser } from "@/hooks/useBlocks";
import { m } from "@/paraglide/messages";

interface ProfileInfosProps {
	profile: UserProfileInfoResponse;
	onEditClick?: () => void;
	isOwnProfile?: boolean;
}

export function ProfileInfos({
	profile,
	onEditClick,
	isOwnProfile = false,
}: ProfileInfosProps) {
	const { displayName, avatarUrl, bio, location } = profile;
	const { authData } = useRouteContext({ from: "__root__" });
	const unblockUser = useUnblockUser();

	return (
		<div className="flex flex-col md:flex-row gap-2 lg:gap-4 self-center lg:self-start w-full md:w-lg">
			<ProfilePictureDialog avatar={avatarUrl} displayName={displayName} />
			<div className="flex flex-col gap-2 justify-center flex-1 min-w-0">
				<div className="flex flex-row w-full justify-between gap-2 items-center">
					<div className="flex flex-row flex-wrap items-center gap-2 min-w-0">
						<p className="font-extrabold text-sm md:text-base">{displayName}</p>
						{profile.isPrivate ? (
							<IconLock
								size={16}
								className="text-muted-foreground"
								aria-label={m.noble_ivory_mesa()}
							/>
						) : null}
						{profile.followsYou ? (
							<Badge variant="secondary">{m.peppy_azure_ember()}</Badge>
						) : null}
					</div>
					{isOwnProfile ? (
						<Button
							variant="secondary"
							size="sm"
							onClick={onEditClick}
							className="shrink-0"
						>
							<IconEdit />
							<span className="hidden md:flex">{m.fierce_scarlet_moose()}</span>
						</Button>
					) : (
						<div className="flex shrink-0 items-center gap-2">
							{profile.blocked ? (
								<Button
									variant="secondary"
									size="sm"
									disabled={unblockUser.isPending}
									onClick={() => unblockUser.mutate(profile.name)}
								>
									{m.fluffy_khaki_hazel()}
								</Button>
							) : profile.blocksYou ? null : (
								<ProfileFollowButton
									username={profile.name}
									displayName={displayName}
									isPrivate={profile.isPrivate}
									followStatus={profile.followStatus}
									followsYou={profile.followsYou}
								/>
							)}
							{authData ? (
								<ProfileActionsMenu
									username={profile.name}
									displayName={displayName}
									blocked={profile.blocked}
								/>
							) : null}
						</div>
					)}
				</div>
				{bio?.trim() ? (
					<p className="text-muted-foreground text-pretty">{bio}</p>
				) : null}
				{location ? (
					<div className="flex flex-row gap-2 items-center text-sm">
						<IconLocation size={16} />
						<p>{location}</p>
					</div>
				) : null}
				<ProfileFollowStats
					username={profile.name}
					displayName={displayName}
					followerCount={profile.followerCount}
					followingCount={profile.followingCount}
					isOwnProfile={isOwnProfile}
					canView={profile.canView}
					pendingRequestCount={profile.pendingRequestCount}
					sentRequestCount={profile.sentRequestCount}
				/>
			</div>
		</div>
	);
}
