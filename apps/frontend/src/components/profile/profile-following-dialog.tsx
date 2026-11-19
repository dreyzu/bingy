import { useState } from "react";
import type { FollowUser } from "@/api/follows";
import { FollowUsersList } from "@/components/profile/follow-users-list";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFollowRequests, useFollowUsers } from "@/hooks/useFollows";
import { m } from "@/paraglide/messages";

interface ProfileFollowingDialogProps {
	username: string;
	displayName: string;
	count: number;
	isOwnProfile: boolean;
	/** False for a private profile the viewer does not follow. */
	canView: boolean;
	/** Follow requests the signed-in user sent that are still waiting. */
	sentRequestCount: number;
}

type FollowingTab = "following" | "pending";

const renderFollowButton = (user: FollowUser) =>
	user.isViewer ? null : (
		<ProfileFollowButton
			username={user.name}
			displayName={user.displayName}
			isPrivate={user.isPrivate}
			followStatus={user.followStatus}
			followsYou={user.followsYou}
		/>
	);

export function ProfileFollowingDialog({
	username,
	displayName,
	count,
	isOwnProfile,
	canView,
	sentRequestCount,
}: ProfileFollowingDialogProps) {
	const [open, setOpen] = useState(false);
	// Pending requests only exist on the signed-in user's own profile.
	const [tab, setTab] = useState<FollowingTab>("following");
	const showPending = isOwnProfile && tab === "pending";

	const followingQuery = useFollowUsers(
		username,
		"following",
		open && !showPending,
	);
	const pendingQuery = useFollowRequests("sent", open && showPending);

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
				{isOwnProfile ? (
					<Tabs
						value={tab}
						onValueChange={(value) => setTab(value as FollowingTab)}
					>
						<TabsList className="w-full">
							<TabsTrigger value="following">
								{m.joyful_lilac_prairie()}
							</TabsTrigger>
							<TabsTrigger value="pending">
								{m.lucky_yellow_crystal()}
								{sentRequestCount > 0 ? (
									<Badge variant="secondary">{sentRequestCount}</Badge>
								) : null}
							</TabsTrigger>
						</TabsList>
					</Tabs>
				) : null}
				{showPending ? (
					<FollowUsersList
						key="pending"
						query={pendingQuery}
						emptyMessage={m.epic_periwinkle_parrot()}
						errorMessage={m.noble_orange_marmot()}
						onNavigate={() => setOpen(false)}
						renderActions={renderFollowButton}
						fixedHeight
					/>
				) : (
					<FollowUsersList
						key="following"
						query={followingQuery}
						emptyMessage={m.alert_turquoise_hazel()}
						errorMessage={m.wise_topaz_barn()}
						onNavigate={() => setOpen(false)}
						renderActions={renderFollowButton}
						fixedHeight
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
