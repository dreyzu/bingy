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
				all: m.empty_inprogress_own_profile_title(),
				watching: m.empty_inprogress_watching_own_profile_title(),
				on_hold: m.empty_inprogress_on_hold_own_profile_title(),
				dropped: m.empty_inprogress_dropped_own_profile_title(),
				completed: m.empty_inprogress_completed_own_profile_title(),
			}
		: {
				all: m.empty_inprogress_other_profile_title({ username }),
				watching: m.empty_inprogress_watching_other_profile_title({ username }),
				on_hold: m.empty_inprogress_on_hold_other_profile_title({ username }),
				dropped: m.empty_inprogress_dropped_other_profile_title({ username }),
				completed: m.empty_inprogress_completed_other_profile_title({ username }),
			};

	const descriptions = isOwnProfile
		? {
				all: m.empty_inprogress_own_profile_desc(),
				watching: m.empty_inprogress_watching_own_profile_desc(),
				on_hold: m.empty_inprogress_on_hold_own_profile_desc(),
				dropped: m.empty_inprogress_dropped_own_profile_desc(),
				completed: m.empty_inprogress_completed_own_profile_desc(),
			}
		: {
				all: m.empty_inprogress_other_profile_desc(),
				watching: m.empty_inprogress_watching_other_profile_desc(),
				on_hold: m.empty_inprogress_on_hold_other_profile_desc(),
				dropped: m.empty_inprogress_dropped_other_profile_desc(),
				completed: m.empty_inprogress_completed_other_profile_desc(),
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
						<Button className="w-35">{m.empty_inprogress_cta()}</Button>
					</Link>
					<SearchCommand
						title={m.form_search_placeholder()}
						showKbdHelper
						showButton
					/>
				</EmptyContent>
			) : null}
		</Empty>
	);
}
