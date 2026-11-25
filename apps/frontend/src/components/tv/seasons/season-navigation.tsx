import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import {
	type NavTarget,
	PreviousNextNav,
} from "@/components/tv/previous-next-nav";
import { useTv } from "@/hooks/useTv";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";

const SPECIALS_SEASON = 0;

interface SeasonNavigationProps {
	tvId: number;
	seasonNumber: number;
}

/**
 * Previous and next season buttons. Like episode navigation, specials
 * (season 0) stay out of the season order, so their page has none.
 */
export function SeasonNavigation({
	tvId,
	seasonNumber,
}: SeasonNavigationProps) {
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);
	// Same query as the layout header, so it is already cached.
	const { data: tv } = useTv(tvId, { language: localeRegion, region });

	// Specials have no place in the season order, so there is nothing to show.
	if (seasonNumber === SPECIALS_SEASON) return null;

	const regularSeasons = (tv?.seasons ?? [])
		.map((season) => season.season_number)
		.filter((number) => number !== SPECIALS_SEASON)
		.sort((a, b) => a - b);
	const previous = regularSeasons
		.filter((number) => number < seasonNumber)
		.at(-1);
	const next = regularSeasons.find((number) => number > seasonNumber);

	const toTarget = (target: number | undefined): NavTarget | undefined =>
		target === undefined
			? undefined
			: {
					link: (
						<Link
							to="/tv/$tvId/season/$seasonNumber"
							params={{
								tvId: tvId.toString(),
								seasonNumber: target.toString(),
							}}
						/>
					),
					shortLabel: m.brave_maroon_bagel({ seasonNumber: target }),
				};

	return (
		<PreviousNextNav
			previous={toTarget(previous)}
			next={toTarget(next)}
			previousLabel={m.smart_bronze_anchor()}
			nextLabel={m.brisk_tan_clover()}
		/>
	);
}
