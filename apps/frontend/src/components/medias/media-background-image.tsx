import { cn } from "cn";
import backgroundPlaceholder from "@/assets/media-backdrop-placeholder.jpg";

/** Fades the backdrop into the page. Shared with the crop preview. */
export const MEDIA_BACKGROUND_MASK_CLASSES =
	"mask-t-from-70% mask-b-from-45% mask-x-from-75%";

interface MediaBackgroundImageProps {
	backgroundImage: string | null;
	/** Vertical crop position, 0 (top) to 100 (bottom). Null keeps the top. */
	focusY?: number | null;
}

export function MediaBackgroundImage({
	backgroundImage,
	focusY,
}: MediaBackgroundImageProps) {
	return (
		// 16:9 up to the max height: narrow screens show the whole image, wider
		// ones crop it, around `focusY`.
		<div className="absolute top-14 lg:top-0 left-1/2 -translate-x-1/2 w-full max-w-xl lg:max-w-7xl aspect-video max-h-75 lg:max-h-112.5 -z-10 overflow-hidden">
			<div className={cn("size-full", MEDIA_BACKGROUND_MASK_CLASSES)}>
				<img
					src={backgroundImage ?? backgroundPlaceholder}
					alt=""
					aria-hidden
					className="block size-full object-cover"
					style={{ objectPosition: `50% ${focusY ?? 0}%` }}
				/>
			</div>
		</div>
	);
}
