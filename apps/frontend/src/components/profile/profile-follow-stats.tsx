import { ProfileFollowRequestsDialog } from "@/components/profile/profile-follow-requests-dialog";
import { ProfileFollowersDialog } from "@/components/profile/profile-followers-dialog";
import { ProfileFollowingDialog } from "@/components/profile/profile-following-dialog";

interface ProfileFollowStatsProps {
	username: string;
	displayName: string;
	followerCount: number;
	followingCount: number;
	isOwnProfile: boolean;
	isPrivate: boolean;
	canView: boolean;
	pendingRequestCount: number | null;
}

export function ProfileFollowStats({
	username,
	displayName,
	followerCount,
	followingCount,
	isOwnProfile,
	isPrivate,
	canView,
	pendingRequestCount,
}: ProfileFollowStatsProps) {
	// Requests only exist for private accounts, but keep the entry visible while
	// some are still pending (e.g. right after switching back to public).
	const showRequests =
		isOwnProfile && (isPrivate || (pendingRequestCount ?? 0) > 0);

	return (
		<div className="flex flex-row flex-wrap gap-3 text-sm">
			<ProfileFollowingDialog
				username={username}
				displayName={displayName}
				count={followingCount}
				isOwnProfile={isOwnProfile}
				canView={canView}
			/>
			<ProfileFollowersDialog
				username={username}
				displayName={displayName}
				count={followerCount}
				isOwnProfile={isOwnProfile}
				canView={canView}
			/>
			{showRequests ? (
				<ProfileFollowRequestsDialog count={pendingRequestCount ?? 0} />
			) : null}
		</div>
	);
}
