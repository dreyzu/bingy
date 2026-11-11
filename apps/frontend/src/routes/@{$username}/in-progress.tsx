import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { z } from "zod";
import type { InProgressFilter } from "@/api/in-progress";
import { InProgressContainer } from "@/components/lists/in-progress/in-progress-container";
import { GlobalLoadingIndicator } from "@/components/loading/loading-global";
import { useInProgress } from "@/hooks/useInProgress";
import { localeRegionAtom } from "@/lib/atoms/region";
import { isOwnProfile } from "@/utils/utils";

const inProgressSearchSchema = z.object({
	filter: z
		.enum(["all", "watching", "on_hold", "dropped", "completed"])
		.optional()
		.catch(undefined),
});

export const Route = createFileRoute("/@{$username}/in-progress")({
	validateSearch: inProgressSearchSchema,
	component: InProgressPage,
});

function InProgressPage() {
	const { username } = Route.useParams();
	const { filter = "watching" } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { authData } = useRouteContext({ from: "__root__" });
	const isOwnProfileFlag = isOwnProfile(authData?.user?.name, username);
	const localeRegion = useAtomValue(localeRegionAtom);
	const [page, setPage] = useState(1);

	const handleFilterChange = (newFilter: InProgressFilter) => {
		navigate({
			search: { filter: newFilter === "watching" ? undefined : newFilter },
		});
		setPage(1);
	};

	const { data, isLoading, isError } = useInProgress(
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
		return <p>Failed to load in-progress shows.</p>;
	}

	return (
		<InProgressContainer
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
