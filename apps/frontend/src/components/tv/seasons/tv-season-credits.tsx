import { useId } from "react";
import type { Schemas } from "shared";
import { ScrollToCrewButton } from "@/components/credits/scroll-to-crew-button";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { CastSectionAggregated } from "@/components/person/aggregated/cast-section-aggregated";
import { CrewSectionAggregated } from "@/components/person/aggregated/crew-section-aggregated";
import { BackButton } from "@/components/ui/back-button";
import { m } from "@/paraglide/messages";

interface TvSeasonCreditsViewProps {
	seasonNumber: number;
	credits: Schemas.TvAggregatedCredits | undefined;
	isLoading: boolean;
	isError: boolean;
}

export function TvSeasonCreditsView({
	credits,
	seasonNumber,
	isLoading,
	isError,
}: TvSeasonCreditsViewProps) {
	const crewSectionId = useId();

	if (isLoading) {
		return <LoadingCentered />;
	}

	if (isError || !credits) {
		return (
			<ResourceNotFound
				title={m.winsome_sage_fern()}
				description={m.daring_teal_turtle()}
			/>
		);
	}

	return (
		<div className="w-full scroll-smooth">
			<div className="flex justify-between">
				<BackButton />

				{credits.crew.length > 0 && credits.cast.length > 0 ? (
					<ScrollToCrewButton crewSectionId={crewSectionId} />
				) : null}
			</div>
			<div className="flex flex-col gap-8 pt-2 text-center md:text-left">
				<h2 className="text-2xl font-bold">
					{seasonNumber === 0
						? m.hasty_onyx_wolf()
						: m.modest_sapphire_barn({ seasonNumber: seasonNumber })}
				</h2>
				{credits.cast.length > 0 ? (
					<CastSectionAggregated people={credits.cast} />
				) : null}
				{credits.crew.length > 0 ? (
					<div id={crewSectionId} className="scroll-mt-26 lg:scroll-mt-30">
						<CrewSectionAggregated people={credits.crew} />
					</div>
				) : null}
				{credits.cast.length === 0 && credits.crew.length === 0 ? (
					<p className="text-center">{m.peppy_orange_ember()}</p>
				) : null}
			</div>
		</div>
	);
}
