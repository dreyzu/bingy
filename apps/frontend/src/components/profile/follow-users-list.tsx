import { IconLoader } from "@tabler/icons-react";
import type {
	InfiniteData,
	UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { PaginatedUsers, UserSummary } from "@/api/follows";
import { EmptyUsers } from "@/components/profile/empty-users";
import { UserCard } from "@/components/profile/user-card";

interface FollowUsersListProps<T extends UserSummary> {
	query: UseInfiniteQueryResult<InfiniteData<PaginatedUsers<T>>>;
	emptyMessage: string;
	errorMessage: string;
	renderActions: (user: T) => ReactNode;
	onNavigate?: () => void;
}

/** Scrollable list of users that loads the next page near the bottom. */
export function FollowUsersList<T extends UserSummary>({
	query,
	emptyMessage,
	errorMessage,
	renderActions,
	onNavigate,
}: FollowUsersListProps<T>) {
	const { data, status, hasNextPage, isFetchingNextPage, fetchNextPage } =
		query;

	if (status === "pending") {
		return (
			<div className="flex items-center justify-center py-8">
				<IconLoader className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (status === "error") {
		return <p className="py-8 text-center text-sm">{errorMessage}</p>;
	}

	const users = data.pages.flatMap((page) => page.data);

	if (users.length === 0) return <EmptyUsers message={emptyMessage} />;

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
		if (
			scrollHeight - scrollTop - clientHeight < 100 &&
			hasNextPage &&
			!isFetchingNextPage
		) {
			fetchNextPage();
		}
	};

	return (
		<div
			onScroll={handleScroll}
			className="-mx-4 no-scrollbar max-h-[50vh] lg:max-h-[30vh] overflow-y-auto px-4"
		>
			{users.map((user) => (
				<UserCard
					key={user.name}
					user={user}
					actions={renderActions(user)}
					onNavigate={onNavigate}
				/>
			))}
			{isFetchingNextPage ? (
				<div className="flex justify-center py-2">
					<IconLoader className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			) : null}
		</div>
	);
}
