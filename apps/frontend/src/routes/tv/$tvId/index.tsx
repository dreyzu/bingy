import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { TvDetailsView } from "@/components/tv/tv-details";
import { useTv } from "@/hooks/useTv";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";
import {
	toCastWithCharacters,
	toCrewWithJobs,
} from "@/utils/aggregate-credits";

export const Route = createFileRoute("/tv/$tvId/")({
	component: TvDetailsContainer,
});

function TvDetailsContainer() {
	const { tvId } = Route.useParams();
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);

	const {
		data: tv,
		isLoading,
		isError,
	} = useTv(Number(tvId), {
		append_to_response:
			"aggregate_credits,external_ids,watch/providers,alternative_titles,content_ratings,videos",
		language: localeRegion,
		region,
	});

	// The info tabs shorten these and link to the full credits.
	const cast = toCastWithCharacters(tv?.aggregate_credits?.cast ?? []);
	const crew = toCrewWithJobs(tv?.aggregate_credits?.crew ?? []);

	const watchProviders = tv?.["watch/providers"];

	return (
		<TvDetailsView
			tv={tv}
			watchProviders={watchProviders}
			cast={cast}
			crew={crew}
			isLoading={isLoading}
			isError={isError}
		/>
	);
}
