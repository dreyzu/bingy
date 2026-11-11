import backgroundPlaceholder from "@/assets/media-backdrop-placeholder.jpg";

interface ProfileBannerProps {
	backgroundImage: string | null;
}

export function ProfileBanner({ backgroundImage }: ProfileBannerProps) {
	const bgColor = "var(--background)";

	return (
		<div
			className="absolute top-0 left-0 right-0 mx-auto w-full
				max-w-full md:max-w-120 lg:max-w-160 xl:max-w-177.75
				h-45 md:h-67.5 lg:h-90 xl:h-100
				-z-10 overflow-hidden"
		>
			<img
				src={backgroundImage ?? backgroundPlaceholder}
				alt=""
				className="absolute inset-0 w-full h-full object-cover"
			/>

			<div
				className="absolute inset-0"
				style={{
					background: `radial-gradient(
						circle at center, 
						transparent 0%, 
						${bgColor} 85%
					)`,
				}}
			/>

			<div
				className="absolute inset-0"
				style={{
					background: `linear-gradient(to bottom, transparent 40%, ${bgColor} 100%)`,
				}}
			/>
		</div>
	);
}
