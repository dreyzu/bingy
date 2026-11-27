import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type ArtworkTarget,
	fetchArtworkImages,
	fetchArtworkOverrides,
	resetArtwork,
	setArtwork,
} from "@/api/artwork";
import { toast } from "@/components/ui/toast";
import { m } from "@/paraglide/messages";

export function useArtworkImages(target: ArtworkTarget, enabled: boolean) {
	return useQuery({
		queryKey: ["artwork-images", target.mediaType, target.tmdbId],
		queryFn: () => fetchArtworkImages(target),
		staleTime: 1000 * 60 * 30,
		enabled,
	});
}

export function useArtworkOverrides(target: ArtworkTarget, enabled: boolean) {
	return useQuery({
		queryKey: ["artwork", target.mediaType, target.tmdbId],
		queryFn: () => fetchArtworkOverrides(target),
		enabled,
	});
}

/**
 * An override changes the media's poster or backdrop in every response that
 * shows it (details, lists, search, profiles…), so everything but the session
 * and the image choices is refetched.
 */
function useRefetchAfterArtworkChange() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({
			predicate: ({ queryKey }) =>
				queryKey[0] !== "session" && queryKey[0] !== "artwork-images",
		});
}

export function useSetArtwork() {
	const refetch = useRefetchAfterArtworkChange();

	return useMutation({
		mutationFn: setArtwork,
		onSuccess: async () => {
			await refetch();
			toast.add({ type: "success", title: m.wise_amber_octopus() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.icy_scarlet_sunflower() });
		},
	});
}

export function useResetArtwork() {
	const refetch = useRefetchAfterArtworkChange();

	return useMutation({
		mutationFn: resetArtwork,
		onSuccess: async () => {
			await refetch();
			toast.add({ type: "success", title: m.modest_rose_blossom() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.balmy_copper_pebble() });
		},
	});
}
