import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface ClearMediasButtonProps {
	size?: "sm" | "lg";
	onClear: () => void;
}

export function ClearMediasButton({
	size = "sm",
	onClear,
}: ClearMediasButtonProps) {
	return (
		<Button type="button" variant="outline" size={size} onClick={onClear}>
			{m.icy_pearl_tiger()}
		</Button>
	);
}
