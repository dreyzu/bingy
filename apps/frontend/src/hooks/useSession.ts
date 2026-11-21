import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import {
	type Session,
	sessionQueryOptions,
	signOut,
} from "@/lib/queries/session";
import { m } from "@/paraglide/messages";

/**
 * The signed-in account, or null when signed out. Components read the session
 * here rather than from the route context: this updates as soon as the session
 * changes, while the route context only updates on navigation.
 */
export function useSession(): Session | null {
	const { data } = useQuery(sessionQueryOptions);
	return data ?? null;
}

/** Signs out, then goes to the landing page. */
export function useSignOut() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return async () => {
		try {
			await signOut(queryClient);
		} catch {
			toast.add({ type: "error", title: m.golden_khaki_seal() });
			return;
		}

		toast.add({ type: "success", title: m.epic_azure_mesa() });
		await router.navigate({ to: "/" });
	};
}
