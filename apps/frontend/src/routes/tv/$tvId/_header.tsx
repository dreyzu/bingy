import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { MediaHeaderLayout } from "@/components/medias/media-header-layout";
import {
	useTv,
	useTvEpisodeResources,
	useTvResources,
	useTvSeasonResources,
} from "@/hooks/useTv";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";
import { getTmdbImageUrl } from "@/utils/utils";

export const Route = createFileRoute("/tv/$tvId/_header")({
	component: TvShowHeaderLayout,
});

function TvShowHeaderLayout() {
	const { tvId } = Route.useParams();
	// Set on season and episode pages, which show the season's providers.
	// Episode pages show the episode still as the backdrop instead of the show's.
	const { seasonNumber, episodeNumber } = useParams({ strict: false });
	const hasSeason = seasonNumber !== undefined;
	const hasEpisode = hasSeason && episodeNumber !== undefined;
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);

	const { data: tv, isLoading } = useTv(Number(tvId), {
		language: localeRegion,
		region,
	});

	const { data: showProviders } = useTvResources<Schemas.WatchProviders>(
		Number(tvId),
		"watch/providers",
		undefined,
		{ enabled: !hasSeason },
	);

	const { data: seasonProviders } =
		useTvSeasonResources<Schemas.WatchProviders>(
			Number(tvId),
			Number(seasonNumber),
			"watch/providers",
			undefined,
			{ enabled: hasSeason },
		);

	// Same query as the episode page, so the request is shared.
	const { data: episode, isLoading: isEpisodeLoading } =
		useTvEpisodeResources<Schemas.TvEpisodeDetails>(
			Number(tvId),
			Number(seasonNumber),
			Number(episodeNumber),
			"",
			{ language: localeRegion, region },
			{ enabled: hasEpisode },
		);

	return (
		<MediaHeaderLayout
			media={
				tv
					? {
							type: "tv",
							id: tv.id,
							title: tv.name,
							posterPath: tv.poster_path,
							releaseDate: tv.first_air_date,
						}
					: undefined
			}
			isLoading={isLoading}
			watchProviders={hasSeason ? seasonProviders : showProviders}
			region={region}
			backgroundImage={getTmdbImageUrl(
				episode?.still_path ?? tv?.backdrop_path ?? null,
			)}
			isBackgroundLoading={isLoading || isEpisodeLoading}
		>
			<Outlet />
		</MediaHeaderLayout>
	);
}
