import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteAvatar,
	deleteBanner,
	fetchUserActivity,
	fetchUserFavorites,
	fetchUserLists,
	fetchUserProfileInfo,
	fetchUserWatchlist,
	type UpdateBannerPayload,
	type UpdateUserProfilePayload,
	updateAvatar,
	updateBanner,
	updateUserProfile,
} from "@/api/user-profile";
import { toast } from "@/components/ui/toast";
import { refreshSession } from "@/lib/queries/session";
import { m } from "@/paraglide/messages";

export function useUserProfileInfo(username: string) {
	return useQuery({
		queryKey: ["user-profile", username],
		queryFn: () => fetchUserProfileInfo(username),
		staleTime: 1000 * 60 * 10,
		enabled: !!username,
	});
}

export function useUserActivity(username: string, language = "en-US") {
	return useQuery({
		queryKey: ["user-profile", username, "activity", language],
		queryFn: () => fetchUserActivity(username, language),
		staleTime: 1000 * 60 * 5,
		enabled: !!username,
	});
}

export function useUserFavorites(username: string, language = "en-US") {
	return useQuery({
		queryKey: ["user-profile", username, "favorites", language],
		queryFn: () => fetchUserFavorites(username, language),
		staleTime: 1000 * 60 * 10,
		enabled: !!username,
	});
}

export function useUserWatchlist(username: string, language = "en-US") {
	return useQuery({
		queryKey: ["user-profile", username, "watchlist", language],
		queryFn: () => fetchUserWatchlist(username, language),
		staleTime: 1000 * 60 * 10,
		enabled: !!username,
	});
}

export function useUserLists(username: string, language = "en-US") {
	return useQuery({
		queryKey: ["user-profile", username, "lists", language],
		queryFn: () => fetchUserLists(username, language),
		staleTime: 1000 * 60 * 10,
		enabled: !!username,
	});
}

export function useUpdateAvatar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (file: File) => {
			return updateAvatar(file);
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
				exact: false,
			});

			await refreshSession(queryClient);

			toast.add({ type: "success", title: m.peppy_wine_cherry() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.stellar_sienna_cricket() });
		},
	});
}

export function useDeleteAvatar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			return deleteAvatar();
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
				exact: false,
			});

			await refreshSession(queryClient);

			toast.add({ type: "success", title: m.zesty_pink_valley() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.clever_azure_barn() });
		},
	});
}

export function useUpdateUserProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateUserProfilePayload) => {
			return updateUserProfile(payload);
		},
		onSuccess: (_data) => {
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
				exact: false,
			});

			toast.add({ type: "success", title: m.steady_copper_cactus() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.cozy_mauve_zebra() });
		},
	});
}

export function useUpdateBanner() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateBannerPayload) => {
			return updateBanner(payload);
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
				exact: false,
			});

			await refreshSession(queryClient);

			toast.add({ type: "success", title: m.dapper_azure_coral() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.fancy_pink_jaguar() });
		},
	});
}

export function useDeleteBanner() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			return deleteBanner();
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
				exact: false,
			});

			await refreshSession(queryClient);

			toast.add({ type: "success", title: m.icy_slate_beaver() });
		},
		onError: () => {
			toast.add({ type: "error", title: m.agile_topaz_clover() });
		},
	});
}
