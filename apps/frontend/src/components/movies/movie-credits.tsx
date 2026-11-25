import { IconChevronLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
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
import { buttonVariants } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface MovieCreditsViewProps {
	movieId: number;
	credits: Schemas.MovieCreditsWithTitle | undefined;
	section?: CreditsSection;
	isLoading: boolean;
	isError: boolean;
}

export function MovieCreditsView({
	movieId,
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
			<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
				<Link
					to="/movies/$movieId"
					params={{ movieId: movieId.toString() }}
					className={buttonVariants({
						variant: "ghost",
						className: "-ml-2 w-fit max-w-full text-muted-foreground",
					})}
				>
					<IconChevronLeft data-icon="inline-start" />
					<span className="truncate">{credits.title}</span>
				</Link>
				{credits.crew.length > 0 && credits.cast.length > 0 ? (
					<>
						<ScrollToCrewButton
							crewSectionId={CREW_SECTION_ID}
							className="-mr-2 ml-auto"
						/>
						<ScrollToTopButton crewSectionId={CREW_SECTION_ID} />
					</>
				) : null}
			</div>
			<div className="flex flex-col gap-8 pt-2 text-center md:text-left">
				<CastCreditsSection
					people={castFromCredits(credits.cast)}
					showDetails={false}
				/>
				<div id={CREW_SECTION_ID} className="scroll-mt-26 lg:scroll-mt-30">
					<CrewCreditsSection
						people={crewFromCredits(credits.crew)}
						showDetails={false}
					/>
				</div>
			</div>
		</div>
	);
}
