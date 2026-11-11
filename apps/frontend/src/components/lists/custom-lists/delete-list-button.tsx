import { IconTrash } from "@tabler/icons-react";
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
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteList } from "@/hooks/useLists";
import { m } from "@/paraglide/messages";

interface DeleteListButtonProps {
	listId: string;
	listName: string;
	size: "icon-lg" | "icon-sm";
	onRedirect?: () => void;
	username: string;
}

export function DeleteListButton({
	listId,
	listName,
	size,
	onRedirect,
	username,
}: DeleteListButtonProps) {
	const [open, setOpen] = useState(false);
	const { mutate: deleteList, isPending } = useDeleteList(username);

	const handleDelete = () => {
		deleteList(listId);
		setOpen(false);
		onRedirect?.();
	};

	return (
		<>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant={"destructive"}
							size={size}
							onClick={() => setOpen(true)}
							disabled={isPending}
							aria-label={m.grand_sepia_oasis()}
						>
							<IconTrash />
						</Button>
					}
				></TooltipTrigger>
				<TooltipContent>
					<p>{m.hasty_peach_basil({ list_name: listName })}</p>
				</TooltipContent>
			</Tooltip>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{m.modest_aqua_dolphin()}</AlertDialogTitle>
						<AlertDialogDescription>
							{m.quiet_amber_harbor({ list_name: listName })}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>
							{m.lean_sepia_rocket()}
						</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} disabled={isPending}>
							{m.zesty_pearl_kettle()}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
