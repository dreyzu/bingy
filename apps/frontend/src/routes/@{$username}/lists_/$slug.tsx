import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { ListContainer } from "@/components/lists/custom-lists/list-container";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { toast } from "@/components/ui/toast";
import { useListBySlug } from "@/hooks/useLists";
import { useSession } from "@/hooks/useSession";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/@{$username}/lists_/$slug")({
	component: ListPage,
});

function ListPage() {
	const { username, slug } = Route.useParams();
	const navigate = useNavigate();
	const localeRegion = useAtomValue(localeRegionAtom);
	const session = useSession();
	const userNameFromSession = session?.user?.name;
	const isOwnProfile =
		userNameFromSession?.toLowerCase() === username.toLowerCase();

	const [page, setPage] = useState(1);
	const {
		data: list,
		isLoading,
		error,
	} = useListBySlug(username, slug, localeRegion, page);

	if (isLoading) return <LoadingCentered />;
	if (!list || error) {
		toast.add({ type: "error", title: m.sweet_peach_valley() });
		navigate({ to: "/@{$username}/lists", params: { username } });
		return;
	}

	return (
		<ListContainer
			username={username}
			list={list}
			page={page}
			totalPages={list.total_pages}
			onPageChange={setPage}
			isOwnList={isOwnProfile}
		/>
	);
}
