import { Link } from "@tanstack/react-router";
import {
	type NavTarget,
	PreviousNextNav,
} from "@/components/tv/previous-next-nav";
import {
	type EpisodeRef,
	useAdjacentEpisodes,
} from "@/hooks/useAdjacentEpisodes";
import { m } from "@/paraglide/messages";

interface EpisodeNavigationProps {
	tvId: number;
	seasonNumber: number;
	episodeNumber: number;
}

/** Previous and next episode buttons, crossing season boundaries. */
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

	const toTarget = (target: EpisodeRef | undefined): NavTarget | undefined =>
		target
			? {
					link: (
						<Link
							to="/tv/$tvId/season/$seasonNumber/episode/$episodeNumber"
							params={{
								tvId: tvId.toString(),
								seasonNumber: target.seasonNumber.toString(),
								episodeNumber: target.episodeNumber.toString(),
							}}
						/>
					),
					// Names the season too when the target is in another one.
					shortLabel:
						target.seasonNumber === seasonNumber
							? m.gleeful_pink_beaver({ episodeNumber: target.episodeNumber })
							: m.polite_navy_planet({
									seasonNumber: target.seasonNumber,
									episodeNumber: target.episodeNumber,
								}),
				}
			: undefined;

	return (
		<PreviousNextNav
			previous={toTarget(previous)}
			next={toTarget(next)}
			previousLabel={m.rapid_yellow_kettle()}
			nextLabel={m.hardy_orange_daisy()}
		/>
	);
}
