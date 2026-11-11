import { IconMoodWrrrFilled } from "@tabler/icons-react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { m } from "@/paraglide/messages";

interface EmptyProfileProps {
	ownProfile: boolean;
}

export function EmptyProfile({ ownProfile }: EmptyProfileProps) {
	return (
		<Empty className="min-h-100">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<IconMoodWrrrFilled />
				</EmptyMedia>
				<EmptyTitle>{m.nifty_wine_puma()}</EmptyTitle>
				<EmptyDescription>
					{ownProfile
						? m.gleeful_hazel_dolphin()
						: m.lush_indigo_eagle()}
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
