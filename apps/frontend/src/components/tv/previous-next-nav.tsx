import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cloneElement, type ReactElement, type ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import { useIsMobile } from "@/integrations/media-query";

type NavLinkElement = ReactElement<{
	className?: string;
	title?: string;
	children?: ReactNode;
}>;

export interface NavTarget {
	/** A `<Link>` without children. */
	link: NavLinkElement;
	/** Names the target, e.g. "Ep. 3". Shown instead of the label on mobile. */
	shortLabel: string;
}

interface PreviousNextNavProps {
	previous: NavTarget | undefined;
	next: NavTarget | undefined;
	previousLabel: string;
	nextLabel: string;
}

/**
 * Previous and next buttons, each hidden when there is no target. On mobile
 * they show the short target name so they stay large enough to tap.
 */
export function PreviousNextNav({
	previous,
	next,
	previousLabel,
	nextLabel,
}: PreviousNextNavProps) {
	if (!previous && !next) return null;

	return (
		<div className="-mr-2 ml-auto flex shrink-0 gap-1">
			{previous ? (
				<NavButton
					target={previous}
					label={previousLabel}
					direction="previous"
				/>
			) : null}
			{next ? (
				<NavButton target={next} label={nextLabel} direction="next" />
			) : null}
		</div>
	);
}

interface NavButtonProps {
	target: NavTarget;
	label: string;
	direction: "previous" | "next";
}

function NavButton({ target, label, direction }: NavButtonProps) {
	const isMobile = useIsMobile();
	const text = isMobile ? target.shortLabel : label;

	return cloneElement(target.link, {
		className: buttonVariants({
			variant: "ghost",
			className: "text-muted-foreground",
		}),
		// The short label is the visible name; the full one says which way.
		title: isMobile ? label : undefined,
		children:
			direction === "previous" ? (
				<>
					<IconChevronLeft data-icon="inline-start" />
					{text}
				</>
			) : (
				<>
					{text}
					<IconChevronRight data-icon="inline-end" />
				</>
			),
	});
}
