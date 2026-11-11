import { Link } from "@tanstack/react-router";
import { m } from "@/paraglide/messages";
import type { VisibilityFilter } from "./lists-container";

type ListsEmptyStateProps = {
	isOwnProfile: boolean;
	username: string;
	filter: VisibilityFilter;
};

export function ListsEmptyState({
	isOwnProfile,
	username,
	filter,
}: ListsEmptyStateProps) {
	const messageMap: Record<VisibilityFilter, () => string> = {
		all: m.lively_lilac_garden,
		public: m.fluffy_umber_beacon,
		private: m.dusky_lemon_galaxy,
		limited: m.joyful_copper_acorn,
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-100 gap-4">
			<p className="text-muted-foreground text-center">
				{isOwnProfile ? (
					<>
						{messageMap[filter]()}{" "}
						<Link to="/lists/create" className="text-primary hover:underline">
							{m.vivid_pink_cloud()}
						</Link>
					</>
				) : (
					m.candid_lavender_narwhal({ username })
				)}
			</p>
		</div>
	);
}
