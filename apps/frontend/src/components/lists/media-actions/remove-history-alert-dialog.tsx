import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { m } from "@/paraglide/messages";

interface RemoveHistoryAlertDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mediaName: string;
	onConfirm: () => void;
}

export function RemoveHistoryAlertDialog({
	open,
	onOpenChange,
	mediaName,
	onConfirm,
}: RemoveHistoryAlertDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogTitle>
					{m.plucky_tan_hippo()}
				</AlertDialogTitle>
				<AlertDialogDescription>
					{m.mighty_azure_oasis({
						media_name: mediaName,
					})}
				</AlertDialogDescription>
				<AlertDialogFooter>
					<AlertDialogCancel>
						{m.plucky_violet_jaguar()}
					</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>
						{m.brave_periwinkle_pebble()}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
