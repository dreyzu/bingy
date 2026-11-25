import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import type { ReactNode } from "react";
import type { Schemas } from "shared";
import { MediaReleaseYear } from "@/components/medias/media-release-year";
import { PortraitImage } from "@/components/portrait-image";
import { Skeleton } from "@/components/ui/skeleton";
import { WatchProvidersSection } from "@/components/watch-providers/watch-providers-section";
import { useIsMobile } from "@/integrations/media-query";

/** Overrides every breakpoint of PortraitImage's default size. */
const POSTER_CLASSES = "w-20 sm:w-24 md:w-24 lg:w-28 2xl:w-28 shrink-0";

interface TvShowLayoutProps {
	tv: Schemas.TvDetails | undefined;
	isLoading: boolean;
	watchProviders: Schemas.WatchProviders | undefined;
	region: Schemas.WatchProvidersCountry;
	children: ReactNode;
}

export function TvShowLayout({
	tv,
	isLoading,
	watchProviders,
	region,
	children,
}: TvShowLayoutProps) {
	const isMobile = useIsMobile();

	return (
		<div className="grid w-full grid-cols-[auto_1fr] gap-x-3 gap-y-6 pt-2 lg:gap-x-6">
			<div className="lg:row-span-2">
				{tv ? (
					<PortraitImage
						imagePath={tv.poster_path}
						alt={tv.name}
						imageSize="w200"
						category="tv"
						className={POSTER_CLASSES}
					/>
				) : isLoading ? (
					<Skeleton className={cn(POSTER_CLASSES, "aspect-2/3 rounded-lg")} />
				) : null}
			</div>

			<div className="flex min-w-0 flex-col gap-2 self-center lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:self-start">
				<div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
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
				<WatchProvidersSection
					watchProviders={watchProviders}
					region={region}
					logoPosition={isMobile ? "start" : "end"}
					className="shrink-0 self-start pb-0 lg:self-center"
				/>
			</div>

			<div className="col-span-2 min-w-0 lg:col-span-1 lg:col-start-2">
				{children}
			</div>
		</div>
	);
}
