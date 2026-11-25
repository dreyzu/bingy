import { IconArrowUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface ScrollToTopButtonProps {
	/** The button appears once this section reaches the upper half of the screen. */
	crewSectionId: string;
}

/** Floating button that scrolls back to the top of a credits page. */
export function ScrollToTopButton({ crewSectionId }: ScrollToTopButtonProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const update = () => {
			const section = document.getElementById(crewSectionId);
			// Upper half rather than the very top: jumping to the crew stops
			// short of the edge because of the section's scroll margin.
			setIsVisible(
				section !== null &&
					section.getBoundingClientRect().top < window.innerHeight / 2,
			);
		};
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, [crewSectionId]);

	if (!isVisible) return null;

	const label = m.lush_purple_coral();

	return (
		<Button
			variant="secondary"
			size="icon-lg"
			// Above the mobile bottom navbar.
			className="fixed right-4 bottom-24 z-40 size-11 rounded-full shadow-lg lg:right-8 lg:bottom-8"
			aria-label={label}
			title={label}
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
		>
			<IconArrowUp className="size-5" />
		</Button>
	);
}
