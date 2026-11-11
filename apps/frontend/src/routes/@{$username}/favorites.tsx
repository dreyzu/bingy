import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { z } from "zod";
import { FavoriteContainer } from "@/components/lists/favorites/favorites-container";
import { type MediaFilter } from "@/components/lists/media-toggle-group";
import { GlobalLoadingIndicator } from "@/components/loading/loading-global";
import { useFavorites } from "@/hooks/useFavorites";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { isOwnProfile } from "@/utils/utils";

const favoritesSearchSchema = z.object({
	filter: z.enum(["all", "movie", "tv"]).optional().catch(undefined),
});

export const Route = createFileRoute("/@{$username}/favorites")({
	validateSearch: favoritesSearchSchema,
	component: Favorites,
});

function Favorites() {
	const { username } = Route.useParams();
	const { filter = "all" } = Route.useSearch();
	const navigate = Route.useNavigate();
	const { authData } = useRouteContext({ from: "__root__" });
	const localeRegion = useAtomValue(localeRegionAtom);
	const [page, setPage] = useState(1);
	const isOwnProfileFlag = isOwnProfile(authData?.user?.name, username);

	const handleFilterChange = (newFilter: MediaFilter) => {
		navigate({
			search: { filter: newFilter === "all" ? undefined : newFilter },
		});
		setPage(1);
	};

	const { data, isLoading, isError } = useFavorites(
		username,
		page,
		localeRegion,
		filter === "all" ? undefined : filter,
	);

	if (isLoading) {
		return <GlobalLoadingIndicator />;
	}

	if (isError) {
		return <p>{m.candid_coral_marmot()}</p>;
	}

	return (
		<FavoriteContainer
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
