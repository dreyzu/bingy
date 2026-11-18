import type { ReactNode } from "react";
import { MediaBackgroundImage } from "@/components/medias/media-background-image";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";

/** Poster size for detail pages: small beside the header below `lg`. */
export const MEDIA_DETAILS_POSTER_CLASSES =
	"w-28 sm:w-36 md:w-44 lg:w-60 2xl:w-75";

interface MediaDetailsLayoutProps {
	backgroundImage: string | null;
	poster: ReactNode;
	watchProviders?: ReactNode;
	header: ReactNode;
	overview?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
}

/**
 * Below `lg`, the header sits next to a small poster on the right, then the
 * overview, the watch providers, the actions and the rest of the content span
 * the full width, leaving the backdrop visible above. From `lg` up, the
 * poster and watch providers form a left column, and the right column shows
 * the header with the overview below it, the actions beside both, then the
 * content.
 *
 * The overview row is `1fr` so that, when the actions are taller than the
 * header, the extra height goes below the overview instead of between the
 * header and the overview. The right column is `self-start` so it never
 * stretches to the poster column's height: otherwise that row would also grow
 * when the content below is short, and the gap above the content would change
 * when switching tabs.
 *
 * Both column wrappers use `display: contents` below `lg`, so their children
 * become items of the outer grid and are laid out by their `order`.
 */
export function MediaDetailsLayout({
	backgroundImage,
	poster,
	watchProviders,
	header,
	overview,
	actions,
	children,
	className,
}: MediaDetailsLayoutProps) {
	return (
		<>
			<MediaBackgroundImage backgroundImage={backgroundImage} />
			<div className={cn("w-full pt-3 md:pt-10 lg:pt-60", className)}>
				<BackButton />

				<div className="grid grid-cols-[1fr_auto] lg:grid-cols-[auto_1fr] gap-x-3 gap-y-4 lg:gap-4 pt-28 md:pt-40 lg:pt-2">
					<div className="contents lg:flex lg:flex-col lg:gap-2 lg:items-start lg:max-w-60 2xl:max-w-75">
						<div className="order-2 self-start">{poster}</div>
						{watchProviders ? (
							<div className="order-4 col-span-2 lg:w-full empty:hidden">
								{watchProviders}
							</div>
						) : null}
					</div>

					<div className="contents lg:grid lg:grid-cols-[1fr_auto] lg:grid-rows-[auto_1fr] lg:content-start lg:self-start lg:gap-x-2 lg:gap-y-4 lg:w-full lg:overflow-hidden">
						<div className="order-1 min-w-0 self-center lg:self-auto">
							{header}
						</div>
						{overview ? (
							<div className="order-3 col-span-2 lg:col-span-1 lg:col-start-1 min-w-0 pb-4">
								{overview}
							</div>
						) : null}
						{actions ? (
							<div className="order-5 col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start lg:mt-3">
								{actions}
							</div>
						) : null}
						<div className="order-6 col-span-2 min-w-0 max-lg:overflow-hidden flex flex-col gap-4">
							{children}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
