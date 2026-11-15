import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	type AddToFavoritesPayload,
	addToFavorites,
	getFavorite,
	getFavorites,
	removeFromFavorites,
} from "@/api/favorites";
import { toast } from "@/components/toast/toast";
import { m } from "@/paraglide/messages";

export function useFavorites(
	username: string,
	page = 1,
	language: string,
	mediaType?: "movie" | "tv",
) {
	return useQuery({
		queryKey: ["favorites", username, page, language, mediaType],
		queryFn: () => getFavorites(username, page, language, mediaType),
		staleTime: 1000 * 60 * 10,
	});
}

export function useFavorite(tmdbId: number, mediaType: "movie" | "tv") {
	return useQuery({
		queryKey: ["favorites", tmdbId, mediaType],
		queryFn: () => getFavorite(tmdbId, mediaType),
		staleTime: 1000 * 60 * 10,
		enabled: !!tmdbId,
	});
}

export function useAddToFavorites(username: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (payload: AddToFavoritesPayload & { mediaName: string }) =>
			addToFavorites(payload),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["favorites"],
			});
			queryClient.invalidateQueries({
				queryKey: ["ratings"],
			});
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});

			toast.success({
				title: m.keen_gold_raven({ name: variables.mediaName }),
				button: {
					label: m.nifty_sage_meerkat(),
					onClick: () => {
						navigate({
							to: "/@{$username}/favorites",
							params: { username },
						});
					},
				},
			});
		},
		onError: (_error, variables) => {
			toast.error({
				title: m.zesty_sepia_koala({ name: variables.mediaName }),
			});
		},
	});
}

export function useRemoveFromFavorites(username: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			tmdbId,
			mediaType,
		}: {
			tmdbId: number;
			mediaType: "movie" | "tv";
			mediaName: string;
		}) => removeFromFavorites(tmdbId, mediaType),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["favorites"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});

			toast.success({
				title: m.warm_umber_forest({
					name: variables.mediaName,
				}),
			});
		},
		onError: (_error, variables) => {
			toast.error({
				title: m.loyal_azure_bridge({
					name: variables.mediaName,
				}),
			});
		},
	});
}
