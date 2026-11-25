import { Link } from "@tanstack/react-router";
import { getYear } from "date-fns";
import type { Schemas } from "shared";
import fallbackPoster from "@/assets/media-image-placeholder.jpg";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/paraglide/messages";
import { getTmdbImageUrl } from "@/utils/utils";

export function SeasonCard({
	season,
	tvId,
}: {
	season: Schemas.TvDetails["seasons"][number];
	tvId: number;
}) {
	const imageUrl = getTmdbImageUrl(season.poster_path, "w200");
	const isSpecials = season.season_number === 0;
	const title = isSpecials
		? m.lush_slate_pine()
		: m.eager_lilac_penguin({ seasonNumber: season.season_number });
	// Only shown when the season has its own name, e.g. "The Final Season".
	const subtitle =
		!isSpecials && season.name && season.name !== title ? season.name : null;

	return (
		<Link
			to="/tv/$tvId/season/$seasonNumber"
			params={{
				tvId: tvId.toString(),
				seasonNumber: String(season.season_number),
			}}
		>
			<Card className="h-full transition-colors hover:bg-accent">
				<CardContent className="flex items-start gap-3 sm:gap-4">
					<img
						src={imageUrl ?? fallbackPoster}
						alt={season.name}
						className="w-16 sm:w-20 aspect-2/3 shrink-0 rounded-md object-cover"
						onError={(e) => {
							const target = e.currentTarget;
							if (target.src !== fallbackPoster) {
								target.src = fallbackPoster;
							}
						}}
					/>
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<div className="flex items-start justify-between gap-2">
							<div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
								<h3 className="text-base font-semibold">{title}</h3>
								{season.air_date ? (
									<span className="text-sm text-muted-foreground">
										{getYear(season.air_date)}
									</span>
								) : null}
							</div>
							<Badge variant="outline" className="shrink-0">
								{m.nifty_cerise_panda({ count: season.episode_count })}
							</Badge>
						</div>
						{subtitle ? (
							<p className="text-sm font-medium">{subtitle}</p>
						) : null}
						{season.overview ? (
							<p className="text-sm text-muted-foreground line-clamp-3">
								{season.overview}
							</p>
						) : null}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
