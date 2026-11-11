import { EmptyUsers } from "@/components/profile/empty-users";
import type { UserItem } from "@/components/profile/profile-following-dialog";
import { UserCard } from "@/components/profile/user-card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";

interface ProfileFollowersDialogProps {
	users: UserItem[];
}

export function ProfileFollowersDialog({ users }: ProfileFollowersDialogProps) {
	const hasFollowers = users.length > 0;

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button variant="link" className="flex flex-row items-center p-0">
						<span className="font-semibold">
							{users.length ?? 0} {m.grand_purple_zebra()}
						</span>
					</Button>
				}
			/>
			<DialogContent className="max-w-xs md:max-w-lg">
				<DialogHeader>
					<DialogTitle>{m.loyal_ivory_seal()}</DialogTitle>
					<DialogDescription>
						{m.earthy_hazel_bagel()}
					</DialogDescription>
				</DialogHeader>
				{hasFollowers ? (
					<div className="-mx-4 no-scrollbar max-h-[50vh] lg:max-h-[30vh] overflow-y-auto px-4">
						{users.map((user) => (
							<UserCard
								key={user.name}
								name={user.name}
								description={user.description}
								avatarUrl={user.avatarUrl}
							/>
						))}
					</div>
				) : (
					<EmptyUsers message={m.modest_gray_beaver()} />
				)}
			</DialogContent>
		</Dialog>
	);
}
