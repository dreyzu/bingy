import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { creditsSearchSchema } from "@/components/credits/crew-section";
import { TvCreditsView } from "@/components/tv/tv-credits";
import { useTvResources } from "@/hooks/useTv";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";

export const Route = createFileRoute("/tv/$tvId/_header/credits")({
	validateSearch: creditsSearchSchema,
	component: TvCreditsPage,
});

function TvCreditsPage() {
	const { tvId } = Route.useParams();
	const { section } = Route.useSearch();
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);

	const {
		data: credits,
		isLoading,
		isError,
	} = useTvResources<Schemas.TvAggregatedCredits>(
		Number(tvId),
		"aggregate_credits",
		{ language: localeRegion, region },
	);

	return (
		<TvCreditsView
			credits={credits}
			section={section}
			isLoading={isLoading}
			isError={isError}
		/>
	);
}
