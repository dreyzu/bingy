import { IconBan, IconDots } from "@tabler/icons-react";
import { useState } from "react";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBlockUser, useUnblockUser } from "@/hooks/useBlocks";
import { m } from "@/paraglide/messages";

interface ProfileActionsMenuProps {
	username: string;
	displayName: string;
	/** The signed-in user blocked this profile. */
	blocked: boolean;
}

/** "More" menu on someone else's profile. */
export function ProfileActionsMenu({
	username,
	displayName,
	blocked,
}: ProfileActionsMenuProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const blockUser = useBlockUser();
	const unblockUser = useUnblockUser();

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							variant="secondary"
							size="icon-sm"
							aria-label={m.sunny_indigo_harbor({ name: displayName })}
							className="shrink-0"
						>
							<IconDots />
						</Button>
					}
				/>
				<DropdownMenuContent
					align="end"
					className="w-max max-w-(--available-width)"
				>
					{blocked ? (
						<DropdownMenuItem
							disabled={unblockUser.isPending}
							onClick={() => unblockUser.mutate(username)}
						>
							<IconBan />
							{m.balmy_cerise_penguin({ username })}
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							variant="destructive"
							disabled={blockUser.isPending}
							onClick={() => setConfirmOpen(true)}
						>
							<IconBan />
							{m.earthy_orange_lagoon({ username })}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{m.vivid_crimson_iguana({ username })}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{m.wise_slate_acorn()}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{m.fluffy_crimson_yak()}</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => {
								blockUser.mutate(username);
								setConfirmOpen(false);
							}}
						>
							{m.gleeful_navy_mesa()}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
