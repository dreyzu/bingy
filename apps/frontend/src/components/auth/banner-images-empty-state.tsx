import { IconPhotoOff } from "@tabler/icons-react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { m } from "@/paraglide/messages";

export function BackdropImagesEmptyState() {
	return (
		<Empty className="min-h-50">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<IconPhotoOff className="size-4" />
				</EmptyMedia>
				<EmptyTitle>{m.upbeat_magenta_cactus()}</EmptyTitle>
				<EmptyDescription>{m.stellar_purple_pine()}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
