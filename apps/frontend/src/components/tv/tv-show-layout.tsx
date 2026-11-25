import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import type { ReactNode } from "react";
import type { Schemas } from "shared";
import { MediaBackgroundImage } from "@/components/medias/media-background-image";
import { MediaReleaseYear } from "@/components/medias/media-release-year";
import { PortraitImage } from "@/components/portrait-image";
import { Skeleton } from "@/components/ui/skeleton";
import { WatchProvidersSection } from "@/components/watch-providers/watch-providers-section";

/** Overrides every breakpoint of PortraitImage's default size. */
const POSTER_CLASSES = "w-20 sm:w-24 md:w-24 lg:w-60 2xl:w-75 shrink-0";

interface TvShowLayoutProps {
	tv: Schemas.TvDetails | undefined;
	isLoading: boolean;
	watchProviders: Schemas.WatchProviders | undefined;
	region: Schemas.WatchProvidersCountry;
	/** Backdrop behind the header, drawn once it is known. */
	backgroundImage: string | null;
	isBackgroundLoading: boolean;
	children: ReactNode;
}

export function TvShowLayout({
	tv,
	isLoading,
	watchProviders,
	region,
	backgroundImage,
	isBackgroundLoading,
	children,
}: TvShowLayoutProps) {
	return (
		<>
			{isBackgroundLoading ? null : (
				<MediaBackgroundImage backgroundImage={backgroundImage} />
			)}
			<div
				// Same top offset as MediaDetailsLayout, so content starts below the backdrop.
				className="grid w-full grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr] lg:grid-rows-[auto_1fr] gap-x-3 gap-y-4 pt-39 md:pt-58 lg:pt-70 lg:gap-x-6 lg:gap-y-6"
			>
				{/* On mobile, this wrapper is skipped so the title sits left of the
				    poster and the providers get their own row. On desktop, the
				    providers sit below the poster. */}
				<div className="contents lg:row-span-2 lg:flex lg:w-60 lg:flex-col lg:items-center lg:gap-3 lg:self-start 2xl:w-75">
					<div className="order-2 lg:order-none">
						{tv ? (
							<PortraitImage
								imagePath={tv.poster_path}
								alt={tv.name}
								imageSize="w500"
								category="tv"
								className={POSTER_CLASSES}
							/>
						) : isLoading ? (
							<Skeleton
								className={cn(POSTER_CLASSES, "aspect-2/3 rounded-lg")}
							/>
						) : null}
					</div>
					<WatchProvidersSection
						watchProviders={watchProviders}
						region={region}
						className="order-3 col-span-2 min-w-0 justify-self-center pb-0 lg:order-none lg:w-full"
					/>
				</div>

				<div className="order-1 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 self-center lg:order-none lg:col-start-2 lg:row-start-1 lg:self-start">
					{tv ? (
						<>
							<Link
								to="/tv/$tvId"
								params={{ tvId: tv.id.toString() }}
								className="text-2xl lg:text-3xl font-bold hover:underline underline-offset-4"
							>
								{tv.name}
							</Link>
							<MediaReleaseYear releaseDate={tv.first_air_date} />
						</>
					) : isLoading ? (
						<Skeleton className="h-8 w-48" />
					) : null}
				</div>

				<div className="order-4 col-span-2 min-w-0 lg:order-none lg:col-span-1 lg:col-start-2 lg:row-start-2">
					{children}
				</div>
			</div>
		</>
	);
}
