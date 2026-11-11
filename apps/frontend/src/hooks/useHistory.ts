import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	addMovieToHistory,
	addTvToHistory,
	removeMovieHistory,
	removeTvHistory,
	type TrackMoviePayload,
	type TrackTvPayload,
} from "@/api/history";
import { toast } from "@/components/toast/toast";
import { m } from "@/paraglide/messages";

export function useAddMovieToHistory(username: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (payload: TrackMoviePayload) => addMovieToHistory(payload),
		onSuccess: (_res, variables) => {
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
				queryKey: ["user-profile", username],
			});

			toast.success({
				title: m.grand_hazel_salmon(),
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
		},
		onError: () => {
			toast.error({ title: m.bubbly_rose_mesa() });
		},
	});
}

export function useAddTvToHistory(username: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (payload: TrackTvPayload) => addTvToHistory(payload),
		onSuccess: (_res, variables) => {
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
				queryKey: ["user-profile", username],
			});
			queryClient.invalidateQueries({
				queryKey: ["in-progress", username],
			});

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
		},
		onError: () => {
			toast.error({ title: m.loyal_purple_ember() });
		},
	});
}

export function useRemoveMovieHistory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tmdbId: number) => removeMovieHistory(tmdbId),
		onSuccess: (_res, tmdbId) => {
			queryClient.invalidateQueries({
				queryKey: ["ratings"],
			});
			queryClient.invalidateQueries({
				queryKey: ["ratings", "movie", tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["favorites"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
			});

			toast.success({ title: m.proud_maroon_cricket() });
		},
		onError: () => {
			toast.error({ title: m.jaunty_tan_willow() });
		},
	});
}

export function useRemoveTvHistory(username: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tmdbId: number) => removeTvHistory(tmdbId),
		onSuccess: (_res, tmdbId) => {
			queryClient.invalidateQueries({
				queryKey: ["ratings"],
			});
			queryClient.invalidateQueries({
				queryKey: ["ratings", "tv", tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["favorites"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
			});
			queryClient.invalidateQueries({
				queryKey: ["in-progress", username],
			});

			toast.success({ title: m.happy_onyx_hazel() });
		},
		onError: () => {
			toast.error({ title: m.stellar_gray_canyon() });
		},
	});
}
