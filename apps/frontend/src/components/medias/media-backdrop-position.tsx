import { cn } from "cn";
import { useId, useState } from "react";
import type { ArtworkOverride, ArtworkSlot } from "@/api/artwork";
import { MEDIA_BACKGROUND_MASK_CLASSES } from "@/components/medias/media-background-image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSetArtwork } from "@/hooks/useArtwork";
import { m } from "@/paraglide/messages";
import { getTmdbImageUrl } from "@/utils/utils";

interface MediaBackdropPositionProps {
	slot: ArtworkSlot;
	override: ArtworkOverride;
}

/**
 * Picks which part of the backdrop shows where the page is shorter than the
 * image, with a preview of the widest screen, where the most is cropped.
 */
export function MediaBackdropPosition({
	slot,
	override,
}: MediaBackdropPositionProps) {
	const savedFocusY = override.focusY ?? 0;
	const [focusY, setFocusY] = useState(savedFocusY);
	const setArtwork = useSetArtwork();
	const labelId = useId();

	return (
		<div className="flex shrink-0 flex-col gap-2">
			<Label id={labelId}>{m.cozy_topaz_lemur()}</Label>
			{/* The page backdrop at its widest: 80rem by 28.125rem. */}
			<div className="aspect-[128/45] w-full overflow-hidden rounded-lg">
				<div className={cn("size-full", MEDIA_BACKGROUND_MASK_CLASSES)}>
					<img
						src={getTmdbImageUrl(override.filePath, "w1280") ?? undefined}
						alt=""
						className="block size-full object-cover"
						style={{ objectPosition: `50% ${focusY}%` }}
					/>
				</div>
			</div>
			<p className="text-xs text-muted-foreground">{m.dapper_rose_arrow()}</p>
			<div className="flex items-center gap-3">
				<Slider
					aria-labelledby={labelId}
					min={0}
					max={100}
					step={1}
					value={focusY}
					onValueChange={(value) => setFocusY(value as number)}
					disabled={setArtwork.isPending}
					className="flex-1"
				/>
				<Button
					size="sm"
					disabled={focusY === savedFocusY || setArtwork.isPending}
					onClick={() =>
						setArtwork.mutate({ ...slot, filePath: override.filePath, focusY })
					}
				>
					{m.vivid_ruby_iguana()}
				</Button>
			</div>
		</div>
	);
}
