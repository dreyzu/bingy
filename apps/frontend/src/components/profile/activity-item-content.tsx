import { Link } from "@tanstack/react-router";
import type { ActivityItem } from "@/components/profile/profile-activity-section";
import { m } from "@/paraglide/messages";
import { getListLink, getMediaLink, getStars } from "@/utils/utils";

type ActivityItemContentProps = {
	activity: ActivityItem;
	isOwnProfile: boolean;
};

export function ActivityItemContent({
	activity,
	isOwnProfile,
}: ActivityItemContentProps) {
	const usernameLink = `/@${activity.username}`;
	const mediaLink = getMediaLink(activity.mediaId, activity.mediaType);
	const targetUsernameLink = activity.targetUsername
		? `/@${activity.targetUsername}`
		: null;
	const listLink = getListLink(activity.username, activity.listSlug);
	const usernameDisplay = isOwnProfile
		? m.dreamy_copper_tulip()
		: activity.username;
	const ownProfileToString = isOwnProfile ? "true" : "false";

	switch (activity.type) {
		case "added_to_watchlist":
			return (
				<>
					<Link
						to={usernameLink}
						className="hover:text-foreground transition-colors font-medium"
					>
						{usernameDisplay}
					</Link>
					{m.dapper_ruby_moose({
						isOwnProfile: ownProfileToString,
					})}
					{mediaLink ? (
						<Link
							to={mediaLink}
							className="hover:text-foreground transition-colors font-medium"
						>
							{activity.mediaTitle}
						</Link>
					) : null}
					<span className="text-muted-foreground">
						{m.rustic_slate_salmon({
							isOwnProfile: ownProfileToString,
						})}
					</span>
				</>
			);

		case "added_to_favorites":
			return (
				<>
					<Link
						to={usernameLink}
						className="hover:text-foreground transition-colors font-medium"
					>
						{usernameDisplay}
					</Link>
					{m.candid_violet_yak({
						isOwnProfile: ownProfileToString,
					})}
					{mediaLink ? (
						<Link
							to={mediaLink}
							className="hover:text-foreground transition-colors font-medium"
						>
							{activity.mediaTitle}
						</Link>
					) : null}
					<span className="text-muted-foreground">
						{m.lean_lavender_pebble({
							isOwnProfile: ownProfileToString,
						})}
					</span>
				</>
			);

		case "watched":
			return (
				<>
					<Link
						to={usernameLink}
						className="hover:text-foreground transition-colors font-medium"
					>
						{usernameDisplay}
					</Link>
					{m.clever_violet_forest({
						isOwnProfile: ownProfileToString,
					})}
					{mediaLink && (
						<Link
							to={mediaLink}
							className="hover:text-foreground transition-colors font-medium"
						>
							{activity.mediaTitle}
						</Link>
					)}
					{activity.rating && (
						<span className="text-brand font-medium ml-1">
							{getStars(activity.rating)}
						</span>
					)}
				</>
			);

		case "followed_user":
			return (
				<>
					<Link
						to={usernameLink}
						className="hover:text-foreground transition-colors font-medium"
					>
						{usernameDisplay}
					</Link>
					{m.fierce_amber_lemur({
						isOwnProfile: isOwnProfile ? "true" : "false",
					})}
					{targetUsernameLink && (
						<Link
							to={targetUsernameLink}
							className="hover:text-foreground transition-colors font-medium"
						>
							{activity.targetUsername}
						</Link>
					)}
				</>
			);

		case "rated":
			return (
				<>
					<Link
						to={usernameLink}
						className="hover:text-foreground transition-colors font-medium"
					>
						{usernameDisplay}
					</Link>
					{m.eager_lilac_clover({
						isOwnProfile: isOwnProfile ? "true" : "false",
					})}
					{mediaLink && (
						<Link
							to={mediaLink}
							className="hover:text-foreground transition-colors font-medium"
						>
							{activity.mediaTitle}
						</Link>
					)}
					{activity.rating && (
						<span className="text-brand font-medium ml-1">
							{getStars(activity.rating)}
						</span>
					)}
				</>
			);

		case "created_list":
			return (
				<>
					<Link
						to={usernameLink}
						className="hover:text-foreground transition-colors font-medium"
					>
						{usernameDisplay}
					</Link>
					{m.noble_pink_canyon({
						isOwnProfile: isOwnProfile ? "true" : "false",
					})}
					{listLink ? (
						<Link
							to={listLink}
							className="hover:text-foreground transition-colors font-medium"
						>
							{activity.listName}
						</Link>
					) : (
						<span className="font-medium">{activity.listName}</span>
					)}
				</>
			);

		default:
			return null;
	}
}
