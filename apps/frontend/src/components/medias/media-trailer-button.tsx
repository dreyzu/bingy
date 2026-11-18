import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { Button } from "@/components/ui/button";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";

interface MediaTrailerButtonProps {
	videos: Schemas.Video[] | undefined;
}

export function MediaTrailerButton({ videos }: MediaTrailerButtonProps) {
	const localeRegion = useAtomValue(localeRegionAtom);
	const [language = ""] = localeRegion.split("-");
	const trailer = pickTrailer(videos ?? [], language);

	if (!trailer) return null;

	return (
		<Button
			variant="default"
			size="sm"
			className="w-fit"
			nativeButton={false}
			render={
				<a
					href={`https://www.youtube.com/watch?v=${trailer.key}`}
					target="_blank"
					rel="noopener noreferrer"
					title={trailer.name}
				/>
			}
		>
			<IconPlayerPlayFilled data-icon="inline-start" />
			{m.earthy_ochre_kettle()}
		</Button>
	);
}

/**
 * Picks the YouTube trailer to show: the user's language first, then English,
 * then any other language. Official trailers come first, then the most
 * recent.
 */
function pickTrailer(videos: Schemas.Video[], language: string) {
	const languageRank = (video: Schemas.Video) => {
		if (video.iso_639_1 === language) return 0;
		if (video.iso_639_1 === "en") return 1;
		return 2;
	};

	return videos
		.filter((video) => video.site === "YouTube" && video.type === "Trailer")
		.sort(
			(a, b) =>
				languageRank(a) - languageRank(b) ||
				Number(b.official) - Number(a.official) ||
				b.published_at.localeCompare(a.published_at),
		)[0];
}
