import { IconClock, IconUserMinus, IconUserPlus } from "@tabler/icons-react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import type { FollowStatus } from "@/api/follows";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useFollowMutation } from "@/hooks/useFollows";
import { m } from "@/paraglide/messages";

interface ProfileFollowButtonProps {
	username: string;
	displayName: string;
	isPrivate: boolean;
	followStatus: FollowStatus | null;
	/** Shows "Follow back" instead of "Follow". */
	followsYou?: boolean;
}

export function ProfileFollowButton({
	username,
	displayName,
	isPrivate,
	followStatus,
	followsYou = false,
}: ProfileFollowButtonProps) {
	const { authData } = useRouteContext({ from: "__root__" });
	const navigate = useNavigate();
	const followMutation = useFollowMutation();
	const [confirmOpen, setConfirmOpen] = useState(false);

	const setFollow = (follow: boolean) =>
		followMutation.mutate({ username, isPrivate, follow });

	const handleClick = () => {
		if (!authData) {
			navigate({ to: "/signin" });
			return;
		}

		if (followStatus === null) return setFollow(true);

		// Unfollowing a private account hides its content again: ask first.
		if (followStatus === "accepted" && isPrivate) return setConfirmOpen(true);

		setFollow(false);
	};

	return (
		<>
			<Button
				variant={followStatus === null ? "default" : "secondary"}
				size="sm"
				onClick={handleClick}
				disabled={followMutation.isPending}
				className="shrink-0"
			>
				{followStatus === "accepted" ? (
					<>
						<IconUserMinus className="h-4 w-4 mr-1" />
						{m.witty_indigo_narwhal()}
					</>
				) : followStatus === "pending" ? (
					<>
						<IconClock className="h-4 w-4 mr-1" />
						{m.wise_olive_crystal()}
					</>
				) : (
					<>
						<IconUserPlus className="h-4 w-4 mr-1" />
						{followsYou ? m.swift_ruby_jasmine() : m.candid_pearl_mirror()}
					</>
				)}
			</Button>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{m.vivid_umber_garden({ name: displayName })}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{m.hasty_orange_seal()}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{m.modest_topaz_cactus()}</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setFollow(false);
								setConfirmOpen(false);
							}}
						>
							{m.steady_ivory_cloud()}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
