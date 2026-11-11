import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { Pretty } from "shared";
import {
	type AddMediaToListPayload,
	type AddMediaToWatchlistPayload,
	type CreateListPayload,
	deleteList,
	deleteMediaList,
	deleteMediaWatchlist,
	fetchCheckItemInWatchlist,
	fetchListBySlug,
	fetchLists,
	fetchWatchlist,
	patchList,
	postList,
	postMediaList,
	postMediaWatchlist,
	type RemoveMediaFromListPayload,
	type RemoveMediaFromWatchlistPayload,
	type UpdateListPayload,
} from "@/api/lists";
import { toast } from "@/components/toast/toast";
import { m } from "@/paraglide/messages";

export type AddMediaToListMutationVariables = Pretty<
	AddMediaToListPayload & {
		username: string;
		listName: string;
		listSlug: string;
		listId: string;
		title?: string;
		name?: string;
	}
>;

export type RemoveMediaFromListMutationVariables = Pretty<
	RemoveMediaFromListPayload & {
		listSlug: string;
		title?: string;
		name?: string;
		listName: string;
	}
>;

export function useWatchlist(
	username: string,
	page = 1,
	language: string,
	mediaType?: "movie" | "tv",
) {
	return useQuery({
		queryKey: ["lists", "watchlist", username, page, language, mediaType],
		queryFn: () => fetchWatchlist(username, page, language, mediaType),
		staleTime: 1000 * 60 * 10,
	});
}

export function useIsInWatchlist(tmdbMediaType: string, tmdbId: number) {
	return useQuery({
		queryKey: ["lists", "watchlist", "check", tmdbMediaType, tmdbId],
		queryFn: () => fetchCheckItemInWatchlist(tmdbMediaType, tmdbId),
		staleTime: 1000 * 60 * 10,
	});
}

export function useAddMediaToWatchlist(username: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (payload: AddMediaToWatchlistPayload) => {
			return postMediaWatchlist(payload);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile"],
				exact: false,
			});

			const title = variables.title || variables.name;
			toast.success({
				title: m.nimble_green_canyon({ media: `"${title}"` }),
				button: {
					label: m.smart_sage_mesa(),
					onClick: () => {
						navigate({
							to: "/@{$username}/watchlist",
							params: { username },
						});
					},
				},
			});
		},
		onError: (_, variables) => {
			const title = variables.title || variables.name;
			toast.error({
				title: m.polite_copper_clover({ media: `"${title}"` }),
			});
		},
	});
}

export function useRemoveFromWatchlist(username: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: RemoveMediaFromWatchlistPayload) => {
			return deleteMediaWatchlist(payload);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["lists", "watchlist"],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});

			const title = variables.title || variables.name;
			toast.success({
				title: m.grand_gray_meerkat({ media: `"${title}"` }),
			});
		},
		onError: (_, variables) => {
			const title = variables.title || variables.name;
			toast.error({
				title: m.rapid_amber_anchor({ media: `"${title}"` }),
			});
		},
	});
}

export function useLists(username: string, page = 1, filter = "all") {
	return useQuery({
		queryKey: ["lists", "custom-list", username, page, filter],
		queryFn: () => fetchLists(username, page, filter),
		staleTime: 1000 * 60 * 50,
	});
}

export function useInfiniteLists(username: string, filter = "all") {
	return useInfiniteQuery({
		queryKey: ["lists", "custom-list", username, filter],
		queryFn: ({ pageParam }) => fetchLists(username, pageParam, filter),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.page < lastPage.total_pages
				? lastPage.page + 1
				: undefined;
		},
		staleTime: 1000 * 60 * 50,
	});
}

export function useListBySlug(
	username: string,
	slug: string,
	language = "en-US",
	page = 1,
) {
	return useQuery({
		queryKey: ["lists", "custom-list", username, slug, page],
		queryFn: () => fetchListBySlug(username, slug, language, page),
		staleTime: 1000 * 60 * 10,
	});
}

export function useCreateList(username: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateListPayload) => {
			return postList(payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lists", "custom-list"],
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});
		},
	});
}

export function useUpdateList(username: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			listId,
			payload,
		}: {
			listId: string;
			payload: UpdateListPayload;
		}) => {
			return patchList(listId, payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lists", "custom-list"],
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});
		},
	});
}

export function useDeleteList(username: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (listId: string) => {
			return deleteList(listId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lists", "custom-list"],
				exact: false,
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});

			toast.success({ title: m.fierce_ivory_fern() });
		},
		onError: () => {
			toast.error({ title: m.velvet_periwinkle_banjo() });
		},
	});
}

export function useAddMediaToList() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async (variables: AddMediaToListMutationVariables) => {
			const { listName, title, name, ...payload } = variables;
			return postMediaList(payload);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: [
					"lists",
					"custom-list",
					variables.username,
					variables.listSlug,
				],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", variables.username],
			});

			const mediaTitle = variables.title || variables.name;
			toast.success({
				title: m.frosty_cerise_heron({
					media: `"${mediaTitle}"`,
					list: variables.listName,
				}),
				button: {
					label: m.modest_fuchsia_salmon(),
					onClick: () => {
						navigate({
							to: "/@{$username}/lists/$slug",
							params: {
								username: variables.username,
								slug: variables.listSlug,
							},
						});
					},
				},
			});
		},
		onError: (_, variables) => {
			const mediaTitle = variables.title || variables.name;
			toast.error({
				title: m.tender_white_pelican({
					media: `"${mediaTitle}"`,
					list: variables.listName,
				}),
			});
		},
	});
}
export function useRemoveFromList(username: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (variables: RemoveMediaFromListMutationVariables) => {
			const { listName, title, name, ...payload } = variables;
			return deleteMediaList(payload);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["lists", "custom-list", variables.listSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["user-profile", username],
			});

			const title = variables.title || variables.name;
			toast.success({
				title: m.candid_pink_ember({
					media: `"${title}"`,
					list: variables.listName,
				}),
			});
		},
		onError: (_, variables) => {
			const title = variables.title || variables.name;
			toast.error({
				title: m.chilly_gold_jasmine({
					media: `"${title}"`,
					list: variables.listName,
				}),
			});
		},
	});
}
