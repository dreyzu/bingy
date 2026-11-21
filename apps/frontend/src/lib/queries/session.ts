import { type QueryClient, queryOptions } from "@tanstack/react-query";
import { authClient } from "../auth-client";

export type Session = NonNullable<
	Awaited<ReturnType<typeof authClient.getSession>>["data"]
>;

// `data` is null when signed out, with no error.
const getSession = async (fresh = false): Promise<Session | null> => {
	const { data, error } = await authClient.getSession(
		fresh ? { query: { disableCookieCache: true } } : undefined,
	);
	// A failed request must not read as "signed out": throwing keeps the
	// previous session in the cache instead of replacing it with null.
	if (error) throw new Error(error.message ?? error.statusText);
	return data;
};

/**
 * The single source of truth for the signed-in account. It's never stale on
 * its own: it changes when the app signs in or out, after a mutation that
 * changes the user, and when the tab regains focus (see `syncSessionChanges`).
 */
export const sessionQueryOptions = queryOptions({
	queryKey: ["session"],
	queryFn: () => getSession(),
	staleTime: Number.POSITIVE_INFINITY,
	gcTime: Number.POSITIVE_INFINITY,
});

const setSession = async (
	queryClient: QueryClient,
	session: Session | null,
) => {
	// A check started earlier (on focus) would land after this and could bring
	// back the previous account.
	await queryClient.cancelQueries({ queryKey: sessionQueryOptions.queryKey });
	queryClient.setQueryData(sessionQueryOptions.queryKey, session);
};

/**
 * Fetches the session from the server, bypassing the session cookie cache.
 * If the request fails, the cached session is kept and returned.
 */
export const refreshSession = async (
	queryClient: QueryClient,
): Promise<Session | null> => {
	let session: Session | null;
	try {
		session = await getSession(true);
	} catch {
		return queryClient.getQueryData(sessionQueryOptions.queryKey) ?? null;
	}
	await setSession(queryClient, session);
	return session;
};

/**
 * Signs out on the server, then clears the session. Clearing it drops every
 * cached query of the account (see `syncSessionChanges`).
 */
export const signOut = async (queryClient: QueryClient) => {
	const { error } = await authClient.signOut();
	// Keep showing the account if the server still considers it signed in.
	if (error) throw new Error(error.message ?? error.statusText);
	await setSession(queryClient, null);
};
