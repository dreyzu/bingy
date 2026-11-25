import { IconArrowDown } from "@tabler/icons-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface ScrollToCrewButtonProps {
	crewSectionId: string;
	className?: string;
}

/** Scrolls down to the crew section of a credits page. */
export const ScrollToCrewButton = ({
	crewSectionId,
	className,
}: ScrollToCrewButtonProps) => {
	return (
		<Button
			variant="ghost"
			className={cn("text-muted-foreground", className)}
			onClick={() => {
				document.getElementById(crewSectionId)?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}}
		>
			{m.warm_fuchsia_planet()}
			<IconArrowDown data-icon="inline-end" />
		</Button>
	);
};
