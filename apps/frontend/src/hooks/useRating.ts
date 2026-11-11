import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	getMediaAverageRating,
	getMovieRating,
	getRatings,
	getTvRating,
	type RateMoviePayload,
	type RateTvPayload,
	rateMovie,
	rateTvShow,
	removeMovieRating,
	removeTvRating,
} from "@/api/rating";
import { toast } from "@/components/toast/toast";
import { m } from "@/paraglide/messages";

export function useRatings(
	username: string,
	page = 1,
	language: string,
	mediaType?: "movie" | "tv",
) {
	return useQuery({
		queryKey: ["ratings", username, page, language, mediaType],
		queryFn: () => getRatings(username, page, language, mediaType),
		staleTime: 1000 * 60 * 10,
	});
}

export function useMovieRating(username: string, tmdbId: number) {
	return useQuery({
		queryKey: ["ratings", "movie", tmdbId],
		queryFn: () => getMovieRating(username, tmdbId),
		staleTime: 1000 * 60 * 10,
		enabled: !!tmdbId,
	});
}

export function useTvRating(username: string, tmdbId: number) {
	return useQuery({
		queryKey: ["ratings", "tv", tmdbId],
		queryFn: () => getTvRating(username, tmdbId),
		staleTime: 1000 * 60 * 10,
		enabled: !!tmdbId,
	});
}

export function useRateMovie(username: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (payload: RateMoviePayload) => rateMovie(payload),
		onSuccess: (res, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["ratings"],
			});
			queryClient.invalidateQueries({
				queryKey: ["ratings", "movie", variables.tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["average-rating", "movie", variables.tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});

			if (res.rating) {
				toast.success({
					title: m.smart_ruby_compass(),
					button: {
						label: m.vivid_violet_pebble(),
						onClick: () => {
							navigate({
								to: "/@{$username}/history",
								params: { username },
							});
						},
					},
				});
			} else {
				toast.success({ title: m.grand_hazel_salmon() });
			}
		},
		onError: () => {
			toast.error({ title: m.balmy_mauve_dune() });
		},
	});
}

export function useRateTvShow(username: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (payload: RateTvPayload) => rateTvShow(payload),
		onSuccess: (res, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["ratings"],
			});
			queryClient.invalidateQueries({
				queryKey: ["ratings", "tv", variables.tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["average-rating", "tv", variables.tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});
			queryClient.invalidateQueries({
				queryKey: ["in-progress", username],
			});

			if (res.rating) {
				toast.success({
					title: m.grand_purple_jaguar(),
					button: {
						label: m.vivid_violet_pebble(),
						onClick: () => {
							navigate({
								to: "/@{$username}/history",
								params: { username },
							});
						},
					},
				});
			} else {
				toast.success({
					title: m.joyful_copper_pebble(),
					button: {
						label: m.vivid_violet_pebble(),
						onClick: () => {
							navigate({
								to: "/@{$username}/history",
								params: { username },
							});
						},
					},
				});
			}
		},
		onError: () => {
			toast.error({ title: m.dusky_ruby_lagoon() });
		},
	});
}

export function useRemoveMovieRating() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tmdbId: number) => removeMovieRating(tmdbId),
		onSuccess: (_res, tmdbId) => {
			queryClient.invalidateQueries({
				queryKey: ["ratings"],
			});
			queryClient.invalidateQueries({
				queryKey: ["ratings", "movie", tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["average-rating", "movie", tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
			});

			toast.success({ title: m.fancy_sienna_coral() });
		},
		onError: () => {
			toast.error({ title: m.proud_sepia_iguana() });
		},
	});
}

export function useRemoveTvRating(username: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tmdbId: number) => removeTvRating(tmdbId),
		onSuccess: (_res, tmdbId) => {
			queryClient.invalidateQueries({
				queryKey: ["ratings"],
			});
			queryClient.invalidateQueries({
				queryKey: ["ratings", "tv", tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["average-rating", "tv", tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
			});
			queryClient.invalidateQueries({
				queryKey: ["in-progress", username],
			});

			toast.success({ title: m.brisk_topaz_island() });
		},
		onError: () => {
			toast.error({ title: m.vivid_cobalt_island() });
		},
	});
}

export function useMediaAverageRating(
	mediaType: "movie" | "tv",
	tmdbId: number,
) {
	return useQuery({
		queryKey: ["average-rating", mediaType, tmdbId],
		queryFn: () => getMediaAverageRating(mediaType, tmdbId),
		staleTime: 1000 * 60 * 5,
		enabled: !!tmdbId,
	});
}
