import { cn } from "cn";
import { useLayoutEffect, useState } from "react";

/**
 * Overview for media detail pages, clamped to three lines that fade out.
 * Tapping it expands or collapses it.
 */
export function MediaDetailsOverview({ overview }: { overview: string }) {
	// Keyed so the expanded state resets when the overview changes.
	return <ClampedOverview key={overview} overview={overview} />;
}

function ClampedOverview({ overview }: { overview: string }) {
	// Stored in state rather than a ref: the element switches between a <p>
	// and a <button>, and the overflow check must follow the mounted one.
	const [textElement, setTextElement] = useState<HTMLElement | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isOverflowing, setIsOverflowing] = useState(false);

	useLayoutEffect(() => {
		// Once expanded the text no longer overflows, but it must stay
		// interactive so it can be collapsed again.
		if (!textElement || isExpanded) return;

		const measure = () =>
			setIsOverflowing(textElement.scrollHeight > textElement.clientHeight + 1);
		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(textElement);
		return () => observer.disconnect();
	}, [textElement, isExpanded]);

	const className = cn(
		"block w-full text-sm whitespace-pre-line text-foreground text-pretty leading-relaxed text-left",
		!isExpanded && "max-h-[3lh] overflow-hidden",
		!isExpanded && isOverflowing && "mask-b-from-35%",
	);

	if (!isOverflowing && !isExpanded) {
		return (
			<p ref={setTextElement} className={className}>
				{overview}
			</p>
		);
	}

	return (
		<button
			ref={setTextElement}
			type="button"
			aria-expanded={isExpanded}
			onClick={() => setIsExpanded((expanded) => !expanded)}
			className={cn(
				className,
				"cursor-pointer rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
			)}
		>
			{overview}
		</button>
	);
}
