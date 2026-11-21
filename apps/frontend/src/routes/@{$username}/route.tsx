import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { EditProfileDialog } from "@/components/auth/edit-profile-dialog";
import { CenteredLayout } from "@/components/layout/centered-layout";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { BlockedProfile } from "@/components/profile/blocked-profile";
import { PrivateProfile } from "@/components/profile/private-profile";
import { ProfileBanner } from "@/components/profile/profile-banner";
import { ProfileInfos } from "@/components/profile/profile-infos";
import { ProfileNav } from "@/components/profile/profile-nav";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/hooks/useSession";
import { useUserProfileInfo } from "@/hooks/useUserProfile";
import { m } from "@/paraglide/messages";
import { getTmdbImageUrl, isOwnProfile } from "@/utils/utils";

export const Route = createFileRoute("/@{$username}")({
	component: UserProfileLayout,
});

function UserProfileLayout() {
	const { username } = Route.useParams();
	const session = useSession();

	const showEditButton = session
		? isOwnProfile(session.user.name, username)
		: false;
	const navigate = useNavigate();

	const { data, error, isLoading } = useUserProfileInfo(username);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const onEditClick = () => {
		setIsEditDialogOpen(true);
	};

	if (isLoading) return <LoadingCentered />;

	if (!data) {
		// todo: add user 404
		return (
			<CenteredLayout>
				<p>{m.witty_sage_comet()}</p>
			</CenteredLayout>
		);
	}

	if (error) {
		navigate({ to: ".." });
		return toast.add({ type: "error", title: m.sturdy_mint_canyon() });
	}

	const backgroundImage = getTmdbImageUrl(data.bannerUrl);

	return (
		<div className="flex flex-col w-full max-w-full min-w-full pt-8 md:pt-40 lg:pt-50">
			<div className="w-full gap-4 flex flex-col">
				<ProfileBanner backgroundImage={backgroundImage} />
				<ProfileInfos
					profile={data}
					isOwnProfile={showEditButton}
					onEditClick={onEditClick}
				/>
				{data.canView ? (
					<>
						<ProfileNav username={username} />
						<Outlet />
					</>
				) : data.blocked || data.blocksYou ? (
					<BlockedProfile username={data.name} blockedByYou={data.blocked} />
				) : (
					<PrivateProfile followStatus={data.followStatus} />
				)}
				{showEditButton ? (
					<EditProfileDialog
						key={data.name}
						open={isEditDialogOpen}
						onOpenChange={setIsEditDialogOpen}
						bio={data.bio}
						location={data.location}
						bannerUrl={data.bannerUrl}
					/>
				) : null}
			</div>
		</div>
	);
}
