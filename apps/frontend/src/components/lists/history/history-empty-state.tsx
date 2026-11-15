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

type HistoryEmptyStateProps = {
	filter: MediaFilter;
	username: string;
	isOwnProfile: boolean;
};

export function HistoryEmptyState({
	filter,
	username,
	isOwnProfile,
}: HistoryEmptyStateProps) {
	const headerMessages = isOwnProfile
		? {
				all: m.gentle_lemon_tiger(),
				movie: m.jaunty_slate_maple(),
				tv: m.fancy_cream_aspen(),
			}
		: {
				all: m.rapid_magenta_ember({ username }),
				movie: m.rustic_mint_biscuit({ username }),
				tv: m.zesty_saffron_lagoon({ username }),
			};

	const headerDesc = isOwnProfile
		? {
				all: m.polite_green_rabbit(),
				movie: m.alert_olive_mesa(),
				tv: m.eager_lime_prairie(),
			}
		: {
				all: m.fierce_navy_puma({
					username: username,
				}),
				movie: m.chilly_cerise_yarn({
					username: username,
				}),
				tv: m.silent_gold_falcon({
					username: username,
				}),
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
