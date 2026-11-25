import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	type EpisodeRef,
	useAdjacentEpisodes,
} from "@/hooks/useAdjacentEpisodes";
import { useIsMobile } from "@/integrations/media-query";
import { m } from "@/paraglide/messages";

interface EpisodeNavigationProps {
	tvId: number;
	seasonNumber: number;
	episodeNumber: number;
}

/** Previous and next episode buttons. Icon-only on mobile. */
export function EpisodeNavigation({
	tvId,
	seasonNumber,
	episodeNumber,
}: EpisodeNavigationProps) {
	const { previous, next } = useAdjacentEpisodes(
		tvId,
		seasonNumber,
		episodeNumber,
	);

	return (
		<div className="-mr-2 flex shrink-0 gap-1">
			<EpisodeNavigationButton
				tvId={tvId}
				target={previous}
				label={m.rapid_yellow_kettle()}
				direction="previous"
			/>
			<EpisodeNavigationButton
				tvId={tvId}
				target={next}
				label={m.hardy_orange_daisy()}
				direction="next"
			/>
		</div>
	);
}

interface EpisodeNavigationButtonProps {
	tvId: number;
	/** Missing at the first or last episode, or while it loads. */
	target: EpisodeRef | undefined;
	label: string;
	direction: "previous" | "next";
}

function EpisodeNavigationButton({
	tvId,
	target,
	label,
	direction,
}: EpisodeNavigationButtonProps) {
	const isMobile = useIsMobile();
	const size = isMobile ? "icon-sm" : "sm";

	const content =
		direction === "previous" ? (
			<>
				<IconChevronLeft data-icon="inline-start" />
				{isMobile ? null : label}
			</>
		) : (
			<>
				{isMobile ? null : label}
				<IconChevronRight data-icon="inline-end" />
			</>
		);

	if (!target) {
		return (
			<Button
				variant="ghost"
				className="text-muted-foreground"
				size={size}
				disabled
				aria-label={isMobile ? label : undefined}
			>
				{content}
			</Button>
		);
	}

	return (
		<Link
			to="/tv/$tvId/season/$seasonNumber/episode/$episodeNumber"
			params={{
				tvId: tvId.toString(),
				seasonNumber: target.seasonNumber.toString(),
				episodeNumber: target.episodeNumber.toString(),
			}}
			className={buttonVariants({
				variant: "ghost",
				size,
				className: "text-muted-foreground",
			})}
			aria-label={isMobile ? label : undefined}
		>
			{content}
		</Link>
	);
}
