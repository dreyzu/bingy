import backgroundPlaceholder from "@/assets/media-backdrop-placeholder.jpg";

interface MediaBackgroundImageProps {
	backgroundImage: string | null;
}

export function MediaBackgroundImage({
	backgroundImage,
}: MediaBackgroundImageProps) {
	return (
		<div className="absolute top-14 lg:top-0 left-1/2 -translate-x-1/2 w-full max-w-xl lg:max-w-7xl h-75 lg:h-112.5 -z-10 overflow-hidden">
			<div className="w-full max-h-full overflow-hidden mask-t-from-70% mask-b-from-45% mask-x-from-75%">
				<img
					src={backgroundImage ?? backgroundPlaceholder}
					alt=""
					aria-hidden
					className="block w-full h-auto"
				/>
			</div>
		</div>
	);
}
