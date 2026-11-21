import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { z } from "zod";
import type { TrackedShowFilter } from "@/api/tracked-shows";
import { TrackedShowsContainer } from "@/components/lists/tracked-shows/tracked-shows-container";
import { GlobalLoadingIndicator } from "@/components/loading/loading-global";
import { useSession } from "@/hooks/useSession";
import { useTrackedShows } from "@/hooks/useTrackedShows";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { isOwnProfile } from "@/utils/utils";

const showsSearchSchema = z.object({
	filter: z
		.enum(["all", "watching", "on_hold", "dropped", "completed"])
		.optional()
		.catch(undefined),
});

export const Route = createFileRoute("/@{$username}/shows")({
	validateSearch: showsSearchSchema,
	component: ShowsPage,
});

function ShowsPage() {
	const { username } = Route.useParams();
	const { filter = "watching" } = Route.useSearch();
	const navigate = Route.useNavigate();
	const session = useSession();
	const isOwnProfileFlag = isOwnProfile(session?.user?.name, username);
	const localeRegion = useAtomValue(localeRegionAtom);
	const [page, setPage] = useState(1);

	const handleFilterChange = (newFilter: TrackedShowFilter) => {
		navigate({
			search: { filter: newFilter === "watching" ? undefined : newFilter },
		});
		setPage(1);
	};

	const { data, isLoading, isError } = useTrackedShows(
		username,
		page,
		localeRegion,
		24,
		filter,
	);

	if (isLoading) {
		return <GlobalLoadingIndicator />;
	}

	if (isError) {
		return <p>{m.keen_teal_aspen()}</p>;
	}

	return (
		<TrackedShowsContainer
			username={username}
			isOwnProfile={isOwnProfileFlag}
			items={data?.data}
			filter={filter}
			onFilterChange={handleFilterChange}
			page={page}
			totalPages={data?.total_pages ?? 1}
			onPageChange={setPage}
		/>
	);
}
