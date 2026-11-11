import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
	ListsContainer,
	type VisibilityFilter,
} from "@/components/lists/custom-lists/lists-container";
import { GlobalLoadingIndicator } from "@/components/loading/loading-global";
import { toast } from "@/components/toast/toast";
import { useLists } from "@/hooks/useLists";
import { m } from "@/paraglide/messages";

const listsSearchSchema = z.object({
	filter: z
		.enum(["all", "public", "private", "limited"])
		.optional()
		.catch(undefined),
});

export const Route = createFileRoute("/@{$username}/lists_/")({
	validateSearch: listsSearchSchema,
	component: ListsPage,
});

function ListsPage() {
	const { username } = Route.useParams();
	const { filter = "all" } = Route.useSearch();
	const navigate = Route.useNavigate();
	const [page, setPage] = useState(1);
	const { authData } = useRouteContext({ from: "__root__" });
	const userNameFromSession = authData?.user?.name;

	const handleFilterChange = (newFilter: VisibilityFilter) => {
		navigate({
			search: { filter: newFilter === "all" ? undefined : newFilter },
		});
		setPage(1);
	};

	const { data, isLoading, isError } = useLists(username, page, filter);

	if (isLoading) {
		return <GlobalLoadingIndicator />;
	}

	if (!data || isError) {
		return toast.error({ title: m.lists_error() });
	}

	return (
		<ListsContainer
			items={data?.data}
			filter={filter}
			onFilterChange={handleFilterChange}
			page={page}
			totalPages={data?.total_pages ?? 1}
			onPageChange={setPage}
			username={username}
			userNameFromSession={userNameFromSession}
		/>
	);
}
