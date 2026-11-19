import { IconLock } from "@tabler/icons-react";
import type { FollowStatus } from "@/api/follows";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { m } from "@/paraglide/messages";

interface PrivateProfileProps {
	followStatus: FollowStatus | null;
}

/** Shown instead of the profile content to viewers who don't follow a private account. */
export function PrivateProfile({ followStatus }: PrivateProfileProps) {
	return (
		<Empty className="min-h-100">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<IconLock />
				</EmptyMedia>
				<EmptyTitle>{m.nimble_lilac_daisy()}</EmptyTitle>
				<EmptyDescription>
					{followStatus === "pending"
						? m.smart_topaz_compass()
						: m.brave_cobalt_valley()}
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
