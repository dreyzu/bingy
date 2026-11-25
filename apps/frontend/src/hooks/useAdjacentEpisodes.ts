import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { useTv, useTvSeasonResources } from "@/hooks/useTv";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";

export interface EpisodeRef {
	seasonNumber: number;
	episodeNumber: number;
}

const SPECIALS_SEASON = 0;

/**
 * Previous and next episodes of a show, crossing into the adjacent season at
 * the first or last episode. Specials (season 0) only navigate among
 * themselves, and regular seasons never lead into them.
 */
export function useAdjacentEpisodes(
	tvId: number,
	seasonNumber: number,
	episodeNumber: number,
): { previous?: EpisodeRef; next?: EpisodeRef } {
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);
	// Same params as the layout and season page, so these requests are shared.
	const params = { language: localeRegion, region };

	const { data: tv } = useTv(tvId, params);
	const { data: season } = useTvSeasonResources<Schemas.TvSeasonDetails>(
		tvId,
		seasonNumber,
		"",
		params,
	);

	// Episode numbers do not always start at 1, so use the actual list.
	const episodes = season?.episodes ?? [];
	const index = episodes.findIndex(
		(episode) => episode.episode_number === episodeNumber,
	);
	const isFirst = index === 0;
	const isLast = index !== -1 && index === episodes.length - 1;

	const regularSeasons =
		seasonNumber === SPECIALS_SEASON
			? []
			: (tv?.seasons ?? [])
					.filter(
						(s) => s.season_number !== SPECIALS_SEASON && s.episode_count > 0,
					)
					.map((s) => s.season_number)
					.sort((a, b) => a - b);
	const previousSeasonNumber = regularSeasons
		.filter((number) => number < seasonNumber)
		.at(-1);
	const nextSeasonNumber = regularSeasons.find(
		(number) => number > seasonNumber,
	);

	// Only fetched at a season boundary.
	const { data: previousSeason } =
		useTvSeasonResources<Schemas.TvSeasonDetails>(
			tvId,
			previousSeasonNumber ?? -1,
			"",
			params,
			{ enabled: isFirst && previousSeasonNumber !== undefined },
		);
	const { data: nextSeason } = useTvSeasonResources<Schemas.TvSeasonDetails>(
		tvId,
		nextSeasonNumber ?? -1,
		"",
		params,
		{ enabled: isLast && nextSeasonNumber !== undefined },
	);

	const toRef = (
		episode: { season_number: number; episode_number: number } | undefined,
	): EpisodeRef | undefined =>
		episode
			? {
					seasonNumber: episode.season_number,
					episodeNumber: episode.episode_number,
				}
			: undefined;

	if (index === -1) return {};

	return {
		previous: isFirst
			? toRef(previousSeason?.episodes.at(-1))
			: toRef(episodes[index - 1]),
		next: isLast ? toRef(nextSeason?.episodes[0]) : toRef(episodes[index + 1]),
	};
}
