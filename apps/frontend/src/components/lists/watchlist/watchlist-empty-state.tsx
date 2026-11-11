import { Link } from "@tanstack/react-router";
import { SearchCommand } from "@/components/search/search-command";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { useMediaQuery } from "@/integrations/media-query";
import { m } from "@/paraglide/messages";

type MediaFilter = "all" | "movie" | "tv";

type WatchlistEmptyStateProps = {
	filter: MediaFilter;
	username: string;
	isOwnProfile: boolean;
};

export function WatchlistEmptyState({
	filter,
	username,
	isOwnProfile,
}: WatchlistEmptyStateProps) {
	const headerMessages = isOwnProfile
		? {
				all: m.lucky_violet_garden(),
				movie: m.primal_amber_meadow(),
				tv: m.steady_mint_valley(),
			}
		: {
				all: m.brave_bronze_island({ username }),
				movie: m.winsome_copper_violin({ username }),
				tv: m.gentle_sienna_turtle({ username }),
			};

	const headerDesc = isOwnProfile
		? {
				all: m.polite_lavender_cactus(),
				movie: m.crisp_beige_daisy(),
				tv: m.witty_coral_lynx(),
			}
		: {
				all: m.nimble_tan_quail(),
				movie: m.hasty_sage_eagle(),
				tv: m.dusky_coral_beaver(),
			};

	const isMobile = useMediaQuery("(pointer: coarse)");

	return (
		<Empty className="min-h-100 w-full">
			<EmptyHeader>
				<EmptyTitle className="text-lg md:text-2xl">
					{headerMessages[filter]}
				</EmptyTitle>
				<EmptyDescription>{headerDesc[filter]}</EmptyDescription>
			</EmptyHeader>
			{isOwnProfile ? (
				<EmptyContent className="w-full">
					<div className="flex flex-row justify-center gap-1 w-40">
						{(filter === "all" || filter === "movie") && (
							<Link to="/movies">
								<Button className="w-35">{m.grand_indigo_sunflower()}</Button>
							</Link>
						)}
						{(filter === "all" || filter === "tv") && (
							<Link to="/tv">
								<Button className="w-35">{m.elegant_lavender_compass()}</Button>
							</Link>
						)}
					</div>
					<SearchCommand
						title={m.breezy_crimson_mesa()}
						className={isMobile ? "w-50 justify-center" : "w-50"}
						showKbdHelper
						showButton
					/>
				</EmptyContent>
			) : null}
		</Empty>
	);
}
