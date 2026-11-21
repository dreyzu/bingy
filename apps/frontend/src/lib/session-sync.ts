import {
	hashKey,
	type QueryClient,
	QueryObserver,
} from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";
import { getDefaultStore } from "jotai";
import { RESET } from "jotai/utils";
import {
	createListDraftItemsAtom,
	editListDraftItemsAtom,
} from "@/lib/atoms/draft-list";
import { type Session, sessionQueryOptions } from "@/lib/queries/session";

const sessionQueryHash = hashKey(sessionQueryOptions.queryKey);

const isSessionQuery = (queryKey: readonly unknown[]) =>
	queryKey[0] === sessionQueryOptions.queryKey[0];

/** Drops everything that belongs to the previous account. */
const clearAccountData = (queryClient: QueryClient) => {
	// Removing (rather than resetting) also cancels in-flight requests, so a
	// response for the previous account can't land in the cache afterwards.
	queryClient.removeQueries({
		predicate: (query) => !isSessionQuery(query.queryKey),
	});
	queryClient.getMutationCache().clear();

	const store = getDefaultStore();
	store.set(createListDraftItemsAtom, RESET);
	store.set(editListDraftItemsAtom, RESET);
};

/**
 * Keeps the whole app on the signed-in account, whatever changed it: signing
 * in or out here, in another tab, or the session expiring.
 *
 * Whenever the session's account changes, all cached data of the previous one
 * is dropped and the router reloads, so route guards and the route context see
 * the new account. The root component remounts the page tree on the same
 * change (see `RootComponent`), which clears local component state too.
 *
 * The session is also checked again when the tab regains focus or the network
 * comes back, to catch changes made in other tabs.
 */
export function syncSessionChanges(
	queryClient: QueryClient,
	router: AnyRouter,
) {
	// `undefined` until the first session is known.
	let userId: string | null | undefined;

	const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
		if (event.query.queryHash !== sessionQueryHash) return;
		if (event.type !== "updated" || event.action.type !== "success") return;

		const session = event.query.state.data as Session | null | undefined;
		const nextUserId = session?.user.id ?? null;
		const previousUserId = userId;
		userId = nextUserId;

		if (previousUserId === undefined || previousUserId === nextUserId) return;

		clearAccountData(queryClient);
		// A navigation started right after this (e.g. to /home after signing
		// in) supersedes this reload, so the two don't conflict.
		void router.invalidate();
	});

	// Lives as long as the app: refetches the session on focus and reconnect.
	const focusObserver = new QueryObserver(queryClient, {
		...sessionQueryOptions,
		refetchOnWindowFocus: "always",
		refetchOnReconnect: "always",
	});
	const unsubscribeObserver = focusObserver.subscribe(() => {});

	return () => {
		unsubscribeCache();
		unsubscribeObserver();
	};
}
