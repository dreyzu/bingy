import { IconPhotoEdit } from "@tabler/icons-react";
import { useState } from "react";
import type { ArtworkTarget } from "@/api/artwork";
import { MediaArtworkDialog } from "@/components/medias/media-artwork-dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { m } from "@/paraglide/messages";

/** Opens the artwork editor of a media. Shown to admins only. */
export function MediaArtworkButton({ mediaType, tmdbId }: ArtworkTarget) {
	const session = useSession();
	const [open, setOpen] = useState(false);

	if (session?.user.role !== "admin") return null;

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				className="w-fit"
				onClick={() => setOpen(true)}
			>
				<IconPhotoEdit data-icon="inline-start" />
				{m.gentle_sienna_jaguar()}
			</Button>
			<MediaArtworkDialog
				open={open}
				onOpenChange={setOpen}
				mediaType={mediaType}
				tmdbId={tmdbId}
			/>
		</>
	);
}
