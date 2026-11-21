import { IconLoader } from "@tabler/icons-react";
import type {
	InfiniteData,
	UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { cn } from "cn";
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
	/**
	 * Always take the full list height, even while loading or empty, so a
	 * dialog switching between lists (tabs) keeps the same size.
	 */
	fixedHeight?: boolean;
}

/** Scrollable list of users that loads the next page near the bottom. */
export function FollowUsersList<T extends UserSummary>({
	query,
	emptyMessage,
	errorMessage,
	renderActions,
	onNavigate,
	fixedHeight = false,
}: FollowUsersListProps<T>) {
	const { data, status, hasNextPage, isFetchingNextPage, fetchNextPage } =
		query;

	const height = fixedHeight
		? "h-[50vh] lg:h-[30vh]"
		: "max-h-[50vh] lg:max-h-[30vh]";
	const stateClassName = cn(
		"flex items-center justify-center",
		fixedHeight && height,
	);

	if (status === "pending") {
		return (
			<div className={cn(stateClassName, "py-8")}>
				<IconLoader className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className={stateClassName}>
				<p className="py-8 text-center text-sm">{errorMessage}</p>
			</div>
		);
	}

	const users = data.pages.flatMap((page) => page.data);

	if (users.length === 0) {
		return (
			<div className={stateClassName}>
				<EmptyUsers message={emptyMessage} />
			</div>
		);
	}

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
			className={cn("-mx-4 no-scrollbar overflow-y-auto px-4", height)}
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
