import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface AddToListButtonProps {
	onClick: () => void;
}

export function AddToListButton({ onClick }: AddToListButtonProps) {
	return (
		<Button variant="ghost" onClick={onClick} className="flex gap-2">
			<span>{m.glossy_green_hippo()}</span>
			<IconPlus className="ml-auto" />
		</Button>
	);
}
