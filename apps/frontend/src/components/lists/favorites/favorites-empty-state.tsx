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

type FavoritesEmptyStateProps = {
	filter: MediaFilter;
	username: string;
	isOwnProfile: boolean;
};

export function FavoritesEmptyState({
	filter,
	username,
	isOwnProfile,
}: FavoritesEmptyStateProps) {
	const headerMessages = isOwnProfile
		? {
				all: m.plucky_sage_arrow(),
				movie: m.earthy_rose_willow(),
				tv: m.golden_cream_octopus(),
			}
		: {
				all: m.hasty_cerise_meerkat({ username }),
				movie: m.winsome_scarlet_pine({ username }),
				tv: m.rapid_sienna_mesa({ username }),
			};

	const headerDesc = isOwnProfile
		? {
				all: m.bold_olive_salmon(),
				movie: m.eager_hazel_oasis(),
				tv: m.icy_crimson_prairie(),
			}
		: {
				all: m.peppy_scarlet_mesa({}),
				movie: m.primal_scarlet_cactus({}),
				tv: m.sweet_amber_rocket({}),
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
						{filter === "all" || filter === "movie" ? (
							<Link to="/movies">
								<Button className="w-35">{m.grand_indigo_sunflower()}</Button>
							</Link>
						) : null}
						{filter === "all" || filter === "tv" ? (
							<Link to="/tv">
								<Button className="w-35">{m.elegant_lavender_compass()}</Button>
							</Link>
						) : null}
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
