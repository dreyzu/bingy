import { Link } from "@tanstack/react-router";
import { isFuture } from "date-fns";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-date";
import { formatRuntime } from "@/utils/format-runtime";

interface EpisodesContainerProps {
	episodes: Schemas.TvSeasonDetails["episodes"];
}

export function EpisodesContainer({ episodes }: EpisodesContainerProps) {
	const localeRegion = useAtomValue(localeRegionAtom);

	return (
		<Card>
			<CardContent className="flex flex-col gap-4">
				{episodes.map((episode, index) => (
					<div key={episode.id}>
						{index > 0 ? <Separator className="mb-4" /> : null}
						<div className="flex flex-col gap-2">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<h3 className="font-semibold text-lg">
										<Link
											to="/tv/$tvId/season/$seasonNumber/episode/$episodeNumber"
											params={{
												tvId: episode.show_id.toString(),
												seasonNumber: episode.season_number.toString(),
												episodeNumber: episode.episode_number.toString(),
											}}
										>
											{episode.episode_number}. {episode.name}
										</Link>
									</h3>
									{episode.air_date ? (
										<p className="text-sm text-muted-foreground">
											{(isFuture(new Date(episode.air_date))
												? m.nimble_orange_crystal
												: m.proud_scarlet_valley)({
												date: formatDate(episode.air_date, localeRegion, {
													year: "numeric",
													month: "short",
													day: "numeric",
												}),
											})}
										</p>
									) : null}
								</div>
								{episode.runtime ? (
									<span className="shrink-0 pt-1 text-sm text-muted-foreground">
										{formatRuntime(episode.runtime)}
									</span>
								) : null}
							</div>
							{episode.overview ? (
								<p className="text-sm whitespace-pre-line max-w-5/6 text-pretty">
									{episode.overview}
								</p>
							) : null}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
