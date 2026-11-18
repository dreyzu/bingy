import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { Button } from "@/components/ui/button";
import { localeRegionAtom } from "@/lib/atoms/region";
import { pickTrailer } from "@/lib/pick-trailer";
import { m } from "@/paraglide/messages";

interface MediaTrailerButtonProps {
	videos: Schemas.Video[] | undefined;
}

export function MediaTrailerButton({ videos }: MediaTrailerButtonProps) {
	const localeRegion = useAtomValue(localeRegionAtom);
	const trailer = pickTrailer(videos ?? [], localeRegion);

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
