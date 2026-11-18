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
	stats?: ReactNode;
	infoTabs?: ReactNode;
	children?: ReactNode;
	className?: string;
}

/**
 * Below `lg`, the header sits next to a small poster on the right, then the
 * overview, the watch providers, the actions, the stats, the info tabs and the
 * rest of the content span the full width, leaving the backdrop visible
 * above. From `lg` up, the poster and watch providers form a left column, and
 * the right column shows the header, the overview and the info tabs stacked,
 * the actions beside them, then the stats and the content.
 *
 * The info tabs row is `1fr` so that, when the actions are taller than what
 * sits beside them, the extra height goes below the tabs instead of between
 * the header, the overview and the tabs. The right column is `self-start` so
 * it never stretches to the poster column's height: otherwise that row would
 * also grow when the content below is short, and the gap above the content
 * would change when switching tabs.
 *
 * Without actions (signed out, or collections), the overview would span the
 * whole right column from `lg` up, so it is capped at three quarters of it to
 * keep lines readable.
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
	stats,
	infoTabs,
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

					<div className="contents lg:grid lg:grid-cols-[1fr_auto] lg:grid-rows-[auto_auto_1fr] lg:content-start lg:self-start lg:gap-x-2 lg:gap-y-4 lg:w-full lg:overflow-hidden">
						<div className="order-1 min-w-0 self-center lg:self-auto lg:col-start-1 lg:row-start-1">
							{header}
						</div>
						{overview ? (
							<div
								className={cn(
									"order-3 col-span-2 lg:col-span-1 lg:col-start-1 lg:row-start-2 min-w-0",
									!actions && "lg:max-w-3/4",
								)}
							>
								{overview}
							</div>
						) : null}
						{actions ? (
							<div className="order-5 col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-start lg:mt-3">
								{actions}
							</div>
						) : null}
						{infoTabs ? (
							<div className="order-7 col-span-2 lg:col-span-1 lg:col-start-1 lg:row-start-3 min-w-0 max-lg:overflow-hidden">
								{infoTabs}
							</div>
						) : null}
						{stats ? (
							<div className="order-6 col-span-2 lg:row-start-4 min-w-0 max-lg:overflow-hidden">
								{stats}
							</div>
						) : null}
						{children ? (
							<div className="order-8 col-span-2 min-w-0 max-lg:overflow-hidden flex flex-col gap-4">
								{children}
							</div>
						) : null}
					</div>
				</div>
			</div>
		</>
	);
}
