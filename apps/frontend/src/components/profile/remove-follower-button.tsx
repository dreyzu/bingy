import { IconX } from "@tabler/icons-react";
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
import { useRemoveFollower } from "@/hooks/useFollows";
import { m } from "@/paraglide/messages";

interface RemoveFollowerButtonProps {
	/** The signed-in user, whose followers list is being edited. */
	ownUsername: string;
	username: string;
	displayName: string;
}

export function RemoveFollowerButton({
	ownUsername,
	username,
	displayName,
}: RemoveFollowerButtonProps) {
	const [open, setOpen] = useState(false);
	const removeFollower = useRemoveFollower(ownUsername);

	return (
		<>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={() => setOpen(true)}
				disabled={removeFollower.isPending}
				aria-label={m.keen_aqua_arrow({ name: displayName })}
			>
				<IconX />
			</Button>
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{m.fluffy_crimson_kettle()}</AlertDialogTitle>
						<AlertDialogDescription>
							{m.brisk_lime_eagle({ name: displayName })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{m.lively_navy_galaxy()}</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								removeFollower.mutate(username);
								setOpen(false);
							}}
						>
							{m.light_orange_otter()}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
