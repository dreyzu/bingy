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
import { toast } from "@/components/ui/toast";
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
				queryKey: ["average-rating", "movie", variables.tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});

			const toastId = toast.add({
				type: "success",
				title: m.grand_hazel_salmon(),
				actionProps: {
					children: m.vivid_violet_pebble(),
					onClick: () => {
						navigate({
							to: "/@{$username}/history",
							params: { username },
						});
						toast.close(toastId);
					},
				},
			});
		},
		onError: () => {
			toast.add({ type: "error", title: m.bubbly_rose_mesa() });
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
				queryKey: ["average-rating", "tv", variables.tmdbId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});
			queryClient.invalidateQueries({
				queryKey: ["tracked-shows", username],
			});
			queryClient.invalidateQueries({
				queryKey: ["progress", username, "tv", variables.tmdbId],
			});

			const toastId = toast.add({
				type: "success",
				title: m.joyful_copper_pebble(),
				actionProps: {
					children: m.vivid_violet_pebble(),
					onClick: () => {
						navigate({
							to: "/@{$username}/history",
							params: { username },
						});
						toast.close(toastId);
					},
				},
			});
		},
		onError: () => {
			toast.add({ type: "error", title: m.loyal_purple_ember() });
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
				queryKey: ["average-rating", "movie", tmdbId],
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

			toast.add({ type: "success", title: m.proud_maroon_cricket() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.jaunty_tan_willow() });
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
				queryKey: ["average-rating", "tv", tmdbId],
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
				queryKey: ["tracked-shows", username],
			});
			queryClient.invalidateQueries({
				queryKey: ["progress", username, "tv", tmdbId],
			});

			toast.add({ type: "success", title: m.happy_onyx_hazel() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.stellar_gray_canyon() });
		},
	});
}
