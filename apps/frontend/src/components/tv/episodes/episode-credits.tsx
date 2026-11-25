import { IconChevronLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useId } from "react";
import type { Schemas } from "shared";
import { CastCreditsSection } from "@/components/credits/cast-credits-section";
import {
	castFromCredits,
	crewFromCredits,
} from "@/components/credits/credit-people";
import { CrewCreditsSection } from "@/components/credits/crew-credits-section";
import { ScrollToCrewButton } from "@/components/credits/scroll-to-crew-button";
import { ScrollToTopButton } from "@/components/credits/scroll-to-top-button";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { buttonVariants } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface TvEpisodeCreditsViewProps {
	tvId: number;
	seasonNumber: number;
	episodeNumber: number;
	credits: Schemas.TvEpisodeCredits | undefined;
	isLoading: boolean;
	isError: boolean;
}

export function TvEpisodeCreditsView({
	credits,
	tvId,
	seasonNumber,
	episodeNumber,
	isLoading,
	isError,
}: TvEpisodeCreditsViewProps) {
	const crewSectionId = useId();
	if (isLoading) {
		return <LoadingCentered />;
	}
	if (isError || !credits) {
		return (
			<ResourceNotFound
				title={m.jaunty_sage_beacon()}
				description={m.zesty_fuchsia_dolphin()}
			/>
		);
	}

	return (
		<div className="w-full scroll-smooth">
			<div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
				<Link
					to="/tv/$tvId/season/$seasonNumber/episode/$episodeNumber"
					params={{
						tvId: tvId.toString(),
						seasonNumber: seasonNumber.toString(),
						episodeNumber: episodeNumber.toString(),
					}}
					className={buttonVariants({
						variant: "ghost",
						className: "-ml-2 w-fit text-muted-foreground",
					})}
				>
					<IconChevronLeft data-icon="inline-start" />
					{m.swift_tan_pelican({ episodeNumber: episodeNumber })}
				</Link>
				{credits.crew.length > 0 && credits.cast.length > 0 ? (
					<>
						<ScrollToCrewButton
							crewSectionId={crewSectionId}
							className="-mr-2 ml-auto"
						/>
						<ScrollToTopButton crewSectionId={crewSectionId} />
					</>
				) : null}
			</div>
			<div className="flex flex-col gap-8 pt-2 text-center md:text-left">
				{credits.cast ? (
					<CastCreditsSection
						people={castFromCredits([...credits.cast, ...credits.guest_stars])}
						showDetails={false}
					/>
				) : null}
				{credits.crew ? (
					<div id={crewSectionId} className="scroll-mt-26 lg:scroll-mt-30">
						<CrewCreditsSection
							people={crewFromCredits(credits.crew)}
							showDetails={false}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}
