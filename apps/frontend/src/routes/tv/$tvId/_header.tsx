import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { TvShowLayout } from "@/components/tv/tv-show-layout";
import { useTv, useTvResources, useTvSeasonResources } from "@/hooks/useTv";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";

export const Route = createFileRoute("/tv/$tvId/_header")({
	component: TvShowHeaderLayout,
});

function TvShowHeaderLayout() {
	const { tvId } = Route.useParams();
	// Set on season and episode pages, which show the season's providers.
	const { seasonNumber } = useParams({ strict: false });
	const hasSeason = seasonNumber !== undefined;
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

	return (
		<TvShowLayout
			tv={tv}
			isLoading={isLoading}
			watchProviders={hasSeason ? seasonProviders : showProviders}
			region={region}
		>
			<Outlet />
		</TvShowLayout>
	);
}
