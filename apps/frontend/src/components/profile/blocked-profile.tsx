import { IconBan } from "@tabler/icons-react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { m } from "@/paraglide/messages";

interface BlockedProfileProps {
	username: string;
	/** True when the signed-in user blocked this profile, false when it blocked them. */
	blockedByYou: boolean;
}

/** Shown instead of the profile content when a block exists either way. */
export function BlockedProfile({
	username,
	blockedByYou,
}: BlockedProfileProps) {
	return (
		<Empty className="min-h-100">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<IconBan />
				</EmptyMedia>
				<EmptyTitle>
					{blockedByYou
						? m.rustic_bronze_zebra({ username })
						: m.dusky_sepia_bamboo({ username })}
				</EmptyTitle>
				<EmptyDescription>
					{blockedByYou ? m.tender_peach_marmot() : m.vibrant_navy_pine()}
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
