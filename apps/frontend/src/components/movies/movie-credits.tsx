import type { Schemas } from "shared";
import { CastCreditsSection } from "@/components/credits/cast-credits-section";
import {
	castFromCredits,
	crewFromCredits,
} from "@/components/credits/credit-people";
import { CrewCreditsSection } from "@/components/credits/crew-credits-section";
import {
	CREW_SECTION_ID,
	type CreditsSection,
	useScrollToCrewSection,
} from "@/components/credits/crew-section";
import { ScrollToCrewButton } from "@/components/credits/scroll-to-crew-button";
import { ScrollToTopButton } from "@/components/credits/scroll-to-top-button";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { m } from "@/paraglide/messages";

interface MovieCreditsViewProps {
	credits: Schemas.MovieCredits | undefined;
	section?: CreditsSection;
	isLoading: boolean;
	isError: boolean;
}

export function MovieCreditsView({
	credits,
	section,
	isLoading,
	isError,
}: MovieCreditsViewProps) {
	useScrollToCrewSection(section, !isLoading && credits !== undefined);
	if (isLoading) {
		return <LoadingCentered />;
	}
	if (isError || !credits) {
		return (
			<ResourceNotFound
				title={m.jolly_green_biscuit()}
				description={m.breezy_green_iguana()}
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
				<CastCreditsSection people={castFromCredits(credits.cast)} />
				<div id={CREW_SECTION_ID} className="scroll-mt-26 lg:scroll-mt-30">
					<CrewCreditsSection people={crewFromCredits(credits.crew)} />
				</div>
			</div>
		</div>
	);
}
