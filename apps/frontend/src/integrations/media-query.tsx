import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const media = window.matchMedia(query);
			media.addEventListener("change", onChange);
			return () => media.removeEventListener("change", onChange);
		},
		[query],
	);

	// Reads the current value synchronously, so the first render already
	// matches the screen instead of starting at `false` and flipping after.
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	);
}

/**
 * Below Tailwind's `lg` breakpoint, where the mobile navigation shows: phones,
 * tablets, and narrow desktop windows. For layout; use `(pointer: coarse)`
 * only for what depends on touch itself, like hover or native pickers.
 */
export function useIsMobile(): boolean {
	return useMediaQuery("(width < 64rem)");
}
