import {
	type InfiniteData,
	type QueryClient,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	acceptFollowRequest,
	declineFollowRequest,
	type FollowListKind,
	type FollowRequestKind,
	type FollowStatus,
	type FollowUsersResponse,
	fetchFollowRequests,
	fetchFollowUsers,
	followUser,
	removeFollower,
	unfollowUser,
	updatePrivacy,
} from "@/api/follows";
import type { UserProfileInfoResponse } from "@/api/user-profile";
import { toast } from "@/components/toast/toast";
import { refreshSession } from "@/lib/queries/session";
import { m } from "@/paraglide/messages";

const getNextPageParam = (lastPage: FollowUsersResponse) =>
	lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;

export function useFollowUsers(
	username: string,
	kind: FollowListKind,
	enabled: boolean,
) {
	return useInfiniteQuery({
		queryKey: ["follows", username, kind],
		queryFn: ({ pageParam }) => fetchFollowUsers(username, kind, pageParam),
		initialPageParam: 1,
		getNextPageParam,
		enabled: enabled && !!username,
		staleTime: 1000 * 60,
	});
}

export function useFollowRequests(kind: FollowRequestKind, enabled: boolean) {
	return useInfiniteQuery({
		queryKey: ["follow-requests", kind],
		queryFn: ({ pageParam }) => fetchFollowRequests(kind, pageParam),
		initialPageParam: 1,
		getNextPageParam,
		enabled,
		staleTime: 1000 * 30,
	});
}

type FollowLists = InfiniteData<FollowUsersResponse>;

function updateFollowListRows(
	queryClient: QueryClient,
	queryKey: string[],
	update: (rows: FollowUsersResponse["data"]) => FollowUsersResponse["data"],
) {
	queryClient.setQueriesData<FollowLists>({ queryKey }, (old) =>
		old
			? {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						data: update(page.data),
					})),
				}
			: old,
	);
}

export function invalidateFollowData(queryClient: QueryClient) {
	queryClient.invalidateQueries({ queryKey: ["user-profile"] });
	queryClient.invalidateQueries({ queryKey: ["follows"] });
	queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
	// Notification rows show follow buttons and answerable requests.
	queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

type FollowVariables = {
	username: string;
	isPrivate: boolean;
	follow: boolean;
};

/**
 * Follows or unfollows a user (or sends / cancels a request for a private
 * account). Updates the profile and follow lists right away, then refetches.
 */
export function useFollowMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ username, follow }: FollowVariables) => {
			if (follow) await followUser(username);
			else await unfollowUser(username);
		},
		onMutate: async ({ username, isPrivate, follow }) => {
			const nextStatus: FollowStatus | null = follow
				? isPrivate
					? "pending"
					: "accepted"
				: null;

			const profileKey = ["user-profile", username];
			await queryClient.cancelQueries({ queryKey: profileKey, exact: true });
			const previousProfile =
				queryClient.getQueryData<UserProfileInfoResponse>(profileKey);

			if (previousProfile) {
				const wasAccepted = previousProfile.followStatus === "accepted";
				const isAccepted = nextStatus === "accepted";
				queryClient.setQueryData<UserProfileInfoResponse>(profileKey, {
					...previousProfile,
					followStatus: nextStatus,
					followerCount:
						previousProfile.followerCount +
						(isAccepted === wasAccepted ? 0 : isAccepted ? 1 : -1),
				});
			}

			for (const queryKey of [["follows"], ["follow-requests", "sent"]]) {
				updateFollowListRows(queryClient, queryKey, (rows) =>
					rows.map((row) =>
						row.name === username ? { ...row, followStatus: nextStatus } : row,
					),
				);
			}

			return { previousProfile, profileKey };
		},
		onError: (_error, _variables, context) => {
			if (context?.previousProfile) {
				queryClient.setQueryData(context.profileKey, context.previousProfile);
			}
			toast.error({ title: m.mighty_ruby_lemur() });
		},
		onSettled: () => invalidateFollowData(queryClient),
	});
}

function useRequestMutation(
	request: (username: string) => Promise<unknown>,
	errorMessage: () => string,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: request,
		onMutate: async (username: string) => {
			const receivedKey = ["follow-requests", "received"];
			await queryClient.cancelQueries({ queryKey: receivedKey });
			updateFollowListRows(queryClient, receivedKey, (rows) =>
				rows.filter((row) => row.name !== username),
			);
		},
		onError: () => toast.error({ title: errorMessage() }),
		onSettled: () => invalidateFollowData(queryClient),
	});
}

export function useAcceptFollowRequest() {
	return useRequestMutation(acceptFollowRequest, m.hardy_jade_tiger);
}

export function useDeclineFollowRequest() {
	return useRequestMutation(declineFollowRequest, m.warm_rust_boulder);
}

/** Removes a follower from the signed-in user (`ownUsername`). */
export function useRemoveFollower(ownUsername: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: removeFollower,
		onMutate: async (username: string) => {
			const followersKey = ["follows", ownUsername, "followers"];
			await queryClient.cancelQueries({ queryKey: followersKey });
			updateFollowListRows(queryClient, followersKey, (rows) =>
				rows.filter((row) => row.name !== username),
			);
		},
		onError: () => toast.error({ title: m.humble_onyx_saddle() }),
		onSettled: () => invalidateFollowData(queryClient),
	});
}

export function useUpdatePrivacy() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updatePrivacy,
		onSuccess: async ({ isPrivate }) => {
			invalidateFollowData(queryClient);

			await refreshSession(queryClient);

			toast.success({
				title: isPrivate ? m.steady_slate_pine() : m.hasty_scarlet_dolphin(),
			});
		},
		onError: () => toast.error({ title: m.chilly_silver_falcon() }),
	});
}
