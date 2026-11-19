import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { sessionQueryOptions } from "@/lib/queries/session";

/**
 * Keeps the app in sync with the signed-in account when it changes outside
 * this tab (signing in or out in another tab). The session is checked again
 * whenever the tab regains focus; if the account changed, cached data from the
 * previous account is reset and the route context is rebuilt.
 */
export function SessionSync() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { authData } = useRouteContext({ from: "__root__" });
	const { data: session, isSuccess } = useQuery({
		...sessionQueryOptions,
		refetchOnWindowFocus: true,
		// The root `beforeLoad` already fetched it.
		refetchOnMount: false,
	});

	const contextUserId = authData?.user.id ?? null;
	const sessionUserId = session?.user.id ?? null;

	useEffect(() => {
		if (!isSuccess || sessionUserId === contextUserId) return;

		queryClient.resetQueries({
			predicate: (query) =>
				query.queryKey[0] !== sessionQueryOptions.queryKey[0],
		});
		router.invalidate();
	}, [isSuccess, sessionUserId, contextUserId, queryClient, router]);

	return null;
}
