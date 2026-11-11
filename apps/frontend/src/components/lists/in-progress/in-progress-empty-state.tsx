import { Link } from "@tanstack/react-router";
import type { InProgressFilter } from "@/api/in-progress";
import { SearchCommand } from "@/components/search/search-command";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { m } from "@/paraglide/messages";

type InProgressEmptyStateProps = {
	filter: InProgressFilter;
	username: string;
	isOwnProfile: boolean;
};

export function InProgressEmptyState({
	filter,
	username,
	isOwnProfile,
}: InProgressEmptyStateProps) {
	const titles = isOwnProfile
		? {
				all: m.primal_topaz_yak(),
				watching: m.jaunty_tan_blossom(),
				on_hold: m.vivid_saffron_acorn(),
				dropped: m.sweet_jade_mesa(),
				completed: m.ample_gray_raven(),
			}
		: {
				all: m.jaunty_onyx_iguana({ username }),
				watching: m.humble_maroon_rocket({ username }),
				on_hold: m.witty_green_hazel({ username }),
				dropped: m.nimble_white_pine({ username }),
				completed: m.balmy_copper_cloud({ username }),
			};

	const descriptions = isOwnProfile
		? {
				all: m.tidy_violet_wolf(),
				watching: m.zesty_mauve_clover(),
				on_hold: m.plucky_rust_beacon(),
				dropped: m.proud_jade_hazel(),
				completed: m.smart_azure_mirror(),
			}
		: {
				all: m.spry_indigo_harbor(),
				watching: m.upbeat_umber_otter(),
				on_hold: m.tidy_onyx_willow(),
				dropped: m.lush_magenta_valley(),
				completed: m.lean_lime_koala(),
			};

	return (
		<Empty className="min-h-100 w-full">
			<EmptyHeader>
				<EmptyTitle className="text-lg md:text-2xl">
					{titles[filter]}
				</EmptyTitle>
				<EmptyDescription>{descriptions[filter]}</EmptyDescription>
			</EmptyHeader>
			{isOwnProfile ? (
				<EmptyContent className="w-full">
					<Link to="/tv">
						<Button className="w-35">{m.breezy_plum_daisy()}</Button>
					</Link>
					<SearchCommand
						title={m.quiet_turquoise_cedar()}
						showKbdHelper
						showButton
					/>
				</EmptyContent>
			) : null}
		</Empty>
	);
}
