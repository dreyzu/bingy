import { IconLoader, IconUserMinus, IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface ProfileFollowButtonProps {
	isFollowing?: boolean;
	isLoading?: boolean;
	onClick?: () => void;
}

export function ProfileFollowButton({
	isFollowing = false,
	isLoading = false,
	onClick,
}: ProfileFollowButtonProps) {
	return (
		<Button
			variant={isFollowing ? "secondary" : "default"}
			size="sm"
			onClick={onClick}
			disabled={isLoading}
			className="shrink-0"
		>
			{isLoading ? (
				<>
					<IconLoader className="animate-spin h-4 w-4 mr-1" />
					{m.smart_plum_willow()}
				</>
			) : isFollowing ? (
				<>
					<IconUserMinus className="h-4 w-4 mr-1" />
					{m.witty_indigo_narwhal()}
				</>
			) : (
				<>
					<IconUserPlus className="h-4 w-4 mr-1" />
					{m.candid_pearl_mirror()}
				</>
			)}
		</Button>
	);
}
