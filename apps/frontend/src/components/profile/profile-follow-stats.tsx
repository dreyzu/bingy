import { ProfileFollowRequestsDialog } from "@/components/profile/profile-follow-requests-dialog";
import { ProfileFollowersDialog } from "@/components/profile/profile-followers-dialog";
import { ProfileFollowingDialog } from "@/components/profile/profile-following-dialog";

interface ProfileFollowStatsProps {
	username: string;
	displayName: string;
	followerCount: number;
	followingCount: number;
	isOwnProfile: boolean;
	canView: boolean;
	pendingRequestCount: number | null;
	sentRequestCount: number | null;
}

export function ProfileFollowStats({
	username,
	displayName,
	followerCount,
	followingCount,
	isOwnProfile,
	canView,
	pendingRequestCount,
	sentRequestCount,
}: ProfileFollowStatsProps) {
	const receivedCount = pendingRequestCount ?? 0;
	const sentCount = sentRequestCount ?? 0;

	return (
		<div className="flex flex-row flex-wrap items-center gap-3 text-sm">
			<ProfileFollowingDialog
				username={username}
				displayName={displayName}
				count={followingCount}
				isOwnProfile={isOwnProfile}
				canView={canView}
				sentRequestCount={sentCount}
			/>
			<ProfileFollowersDialog
				username={username}
				displayName={displayName}
				count={followerCount}
				isOwnProfile={isOwnProfile}
				canView={canView}
			/>
			{isOwnProfile ? (
				<ProfileFollowRequestsDialog count={receivedCount} />
			) : null}
		</div>
	);
}
