import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { FollowUsersList } from "@/components/profile/follow-users-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	useAcceptFollowRequest,
	useDeclineFollowRequest,
	useFollowRequests,
} from "@/hooks/useFollows";
import { m } from "@/paraglide/messages";

interface ProfileFollowRequestsDialogProps {
	/** Requests waiting for the signed-in user's answer. */
	count: number;
}

/**
 * Follow requests received by the signed-in user. Requests sent to others
 * live in the following dialog instead.
 */
export function ProfileFollowRequestsDialog({
	count,
}: ProfileFollowRequestsDialogProps) {
	const [open, setOpen] = useState(false);
	const query = useFollowRequests("received", open);
	const accept = useAcceptFollowRequest();
	const decline = useDeclineFollowRequest();

	// Only shown while there are requests, but an open dialog stays open after
	// answering the last one.
	if (count === 0 && !open) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button
						variant="link"
						className="flex h-auto flex-row items-center gap-1 p-0"
					>
						<span className="font-semibold">{m.crisp_coral_badger()}</span>
						{count > 0 ? <Badge>{count}</Badge> : null}
					</Button>
				}
			/>
			<DialogContent className="max-w-xs md:max-w-lg">
				<DialogHeader>
					<DialogTitle>{m.calm_slate_dune()}</DialogTitle>
					<DialogDescription>{m.noble_hazel_sunflower()}</DialogDescription>
				</DialogHeader>
				<FollowUsersList
					query={query}
					emptyMessage={m.loyal_ruby_planet()}
					errorMessage={m.bubbly_gold_saddle()}
					fixedHeight
					onNavigate={() => setOpen(false)}
					renderActions={(user) => (
						<>
							<Button size="sm" onClick={() => accept.mutate(user.name)}>
								<IconCheck className="h-4 w-4" />
								{m.lucky_aqua_prairie()}
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={() => decline.mutate(user.name)}
								aria-label={m.bubbly_mauve_violin({
									name: user.displayName,
								})}
							>
								<IconX />
							</Button>
						</>
					)}
				/>
			</DialogContent>
		</Dialog>
	);
}
