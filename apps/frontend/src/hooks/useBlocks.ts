import {
	type InfiniteData,
	type QueryClient,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	type BlockedUsersResponse,
	blockUser,
	fetchBlockedUsers,
	unblockUser,
} from "@/api/blocks";
import type { UserProfileInfoResponse } from "@/api/user-profile";
import { toast } from "@/components/ui/toast";
import { invalidateFollowData } from "@/hooks/useFollows";
import { m } from "@/paraglide/messages";

const blocksKey = ["blocks"];

export function useBlockedUsers(enabled = true) {
	return useInfiniteQuery({
		queryKey: blocksKey,
		queryFn: ({ pageParam }) => fetchBlockedUsers(pageParam),
		initialPageParam: 1,
		getNextPageParam: (lastPage: BlockedUsersResponse) =>
			lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
		enabled,
	});
}

/** Applies a block or unblock to the cached profile right away. */
async function setProfileBlocked(
	queryClient: QueryClient,
	username: string,
	blocked: boolean,
) {
	const profileKey = ["user-profile", username];
	await queryClient.cancelQueries({ queryKey: profileKey, exact: true });
	const previous =
		queryClient.getQueryData<UserProfileInfoResponse>(profileKey);

	if (previous && blocked) {
		const followedThem = previous.followStatus === "accepted";
		queryClient.setQueryData<UserProfileInfoResponse>(profileKey, {
			...previous,
			blocked: true,
			canView: false,
			followStatus: null,
			followsYou: false,
			followerCount: previous.followerCount - (followedThem ? 1 : 0),
			followingCount: previous.followingCount - (previous.followsYou ? 1 : 0),
		});
	} else if (previous) {
		// Whether the content is visible again depends on the account's
		// privacy: the refetch after the request settles decides.
		queryClient.setQueryData<UserProfileInfoResponse>(profileKey, {
			...previous,
			blocked: false,
		});
	}

	return { previous, profileKey };
}

function invalidateBlockData(queryClient: QueryClient) {
	invalidateFollowData(queryClient);
	queryClient.invalidateQueries({ queryKey: blocksKey });
}

export function useBlockUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: blockUser,
		onMutate: (username: string) =>
			setProfileBlocked(queryClient, username, true),
		onSuccess: (_data, username) =>
			toast.add({ type: "success", title: m.breezy_onyx_seal({ username }) }),
		onError: (_error, _username, context) => {
			if (context?.previous) {
				queryClient.setQueryData(context.profileKey, context.previous);
			}
			toast.add({ type: "error", title: m.brisk_umber_glacier() });
		},
		onSettled: () => invalidateBlockData(queryClient),
	});
}

export function useUnblockUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: unblockUser,
		onMutate: async (username: string) => {
			await queryClient.cancelQueries({ queryKey: blocksKey });
			queryClient.setQueryData<InfiniteData<BlockedUsersResponse>>(
				blocksKey,
				(old) =>
					old
						? {
								...old,
								pages: old.pages.map((page) => ({
									...page,
									data: page.data.filter((user) => user.name !== username),
								})),
							}
						: old,
			);
			return setProfileBlocked(queryClient, username, false);
		},
		onSuccess: (_data, username) =>
			toast.add({ type: "success", title: m.nifty_rust_fox({ username }) }),
		onError: (_error, _username, context) => {
			if (context?.previous) {
				queryClient.setQueryData(context.profileKey, context.previous);
			}
			toast.add({ type: "error", title: m.tender_yellow_island() });
		},
		onSettled: () => invalidateBlockData(queryClient),
	});
}
