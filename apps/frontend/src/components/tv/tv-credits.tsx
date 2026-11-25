import type { Schemas } from "shared";
import {
	CREW_SECTION_ID,
	type CreditsSection,
	useScrollToCrewSection,
} from "@/components/credits/crew-section";
import { ScrollToCrewButton } from "@/components/credits/scroll-to-crew-button";
import { ScrollToTopButton } from "@/components/credits/scroll-to-top-button";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { CastSectionAggregated } from "@/components/person/aggregated/cast-section-aggregated";
import { CrewSectionAggregated } from "@/components/person/aggregated/crew-section-aggregated";
import { m } from "@/paraglide/messages";

interface TvCreditsViewProps {
	credits: Schemas.TvAggregatedCredits | undefined;
	section?: CreditsSection;
	isLoading: boolean;
	isError: boolean;
}

export function TvCreditsView({
	credits,
	section,
	isLoading,
	isError,
}: TvCreditsViewProps) {
	useScrollToCrewSection(section, !isLoading && credits !== undefined);

	if (isLoading) {
		return <LoadingCentered />;
	}

	if (isError || !credits) {
		return (
			<ResourceNotFound
				title={m.alert_magenta_forest()}
				description={m.fluffy_crimson_biscuit()}
			/>
		);
	}

	return (
		<div className="scroll-smooth w-full">
			<div className="flex justify-between w-full">
				{credits.crew.length > 0 && credits.cast.length > 0 ? (
					<>
						<ScrollToCrewButton
							crewSectionId={CREW_SECTION_ID}
							className="-ml-2"
						/>
						<ScrollToTopButton crewSectionId={CREW_SECTION_ID} />
					</>
				) : null}
			</div>
			<div className="flex flex-col gap-2 mt-4 text-center md:text-left">
				<CastSectionAggregated people={credits.cast} />
				<div id={CREW_SECTION_ID} className="scroll-mt-26 lg:scroll-mt-30">
					<CrewSectionAggregated people={credits.crew} />
				</div>
			</div>
		</div>
	);
}
