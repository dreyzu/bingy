import type { TrackedShow, TrackedShowFilter } from "@/api/tracked-shows";
import { ListPagination } from "@/components/lists/list-pagination";
import { TrackedShowsEmptyState } from "@/components/lists/tracked-shows/tracked-shows-empty-state";
import { TrackedShowsMediaCard } from "@/components/lists/tracked-shows/tracked-shows-media-card";
import { TrackedShowsToggleGroup } from "@/components/lists/tracked-shows/tracked-shows-toggle-group";

type TrackedShowsContainerProps = {
	username: string;
	isOwnProfile: boolean;
	items?: TrackedShow[];
	filter: TrackedShowFilter;
	onFilterChange: (filter: TrackedShowFilter) => void;
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export function TrackedShowsContainer({
	username,
	isOwnProfile,
	items = [],
	filter,
	onFilterChange,
	page,
	totalPages,
	onPageChange,
}: TrackedShowsContainerProps) {
	return (
		<div className="flex flex-col gap-4 flex-1">
			<TrackedShowsToggleGroup value={filter} onValueChange={onFilterChange} />

			{items.length === 0 ? (
				<TrackedShowsEmptyState
					filter={filter}
					username={username}
					isOwnProfile={isOwnProfile}
				/>
			) : (
				<>
					<div className="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-2">
						{items.map((item) => (
							<TrackedShowsMediaCard
								key={`tv-${item.id}`}
								username={username}
								isOwnProfile={isOwnProfile}
								item={item}
							/>
						))}
					</div>

					<ListPagination
						page={page}
						totalPages={totalPages}
						onPageChange={onPageChange}
					/>
				</>
			)}
		</div>
	);
}
