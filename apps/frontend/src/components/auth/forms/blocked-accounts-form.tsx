import { FollowUsersList } from "@/components/profile/follow-users-list";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldTitle,
} from "@/components/ui/field";
import { useBlockedUsers, useUnblockUser } from "@/hooks/useBlocks";
import { m } from "@/paraglide/messages";

function UnblockButton({ username }: { username: string }) {
	const unblockUser = useUnblockUser();

	return (
		<Button
			variant="secondary"
			size="sm"
			disabled={unblockUser.isPending}
			onClick={() => unblockUser.mutate(username)}
		>
			{m.golden_violet_mirror()}
		</Button>
	);
}

export function BlockedAccountsForm() {
	const query = useBlockedUsers();

	return (
		<Field className="py-2">
			<FieldContent>
				<FieldTitle>{m.quick_emerald_heron()}</FieldTitle>
				<FieldDescription>{m.primal_aqua_cactus()}</FieldDescription>
			</FieldContent>
			<FollowUsersList
				query={query}
				emptyMessage={m.chilly_peach_nectar()}
				errorMessage={m.steady_periwinkle_parrot()}
				renderActions={(user) => <UnblockButton username={user.name} />}
			/>
		</Field>
	);
}
