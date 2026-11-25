import {
	IconCalendarWeekFilled,
	IconClock,
	IconStarFilled,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { MediaCreators } from "@/components/medias/media-creators";
import { CastList } from "@/components/person/cast-list";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-date";
import { formatRuntime } from "@/utils/format-runtime";

const WRITER_JOBS = new Set(["Writer", "Screenplay", "Story", "Teleplay"]);

function uniqueById<T extends { id: number }>(people: T[]): T[] {
	return Array.from(
		new Map(people.map((person) => [person.id, person])).values(),
	);
}

interface TvEpisodeDetailViewProps {
	episode: Schemas.TvEpisodeDetails | undefined;
	credits: Schemas.TvEpisodeCredits | undefined;
	tvId: number;
	isLoading: boolean;
	isError: boolean;
}

export function TvEpisodeDetailsView({
	episode,
	credits,
	tvId,
	isLoading,
	isError,
}: TvEpisodeDetailViewProps) {
	const localeRegion = useAtomValue(localeRegionAtom);

	if (isLoading) {
		return <LoadingCentered />;
	}

	if (isError || !episode) {
		return (
			<ResourceNotFound
				title={m.elegant_lavender_mesa()}
				description={m.joyful_amber_comet()}
			/>
		);
	}

	const crew = credits?.crew ?? [];
	const directors = uniqueById(
		crew.filter((person) => person.job === "Director"),
	);
	const writers = uniqueById(
		crew.filter((person) => WRITER_JOBS.has(person.job)),
	);
	const creditsMedia = {
		type: "episode",
		tvId,
		seasonNumber: episode.season_number,
		episodeNumber: episode.episode_number,
	} as const;

	const mergedCast: Schemas.CastMember[] = credits?.cast
		? credits.cast.map((member) => ({
				...member,
				cast_id: member.id,
			}))
		: [];
	if (mergedCast.length < 10 && episode.guest_stars) {
		mergedCast.push(
			...episode.guest_stars.slice(0, 10 - mergedCast.length).map((guest) => ({
				...guest,
				cast_id: guest.id,
			})),
		);
	}

	return (
		<div className="w-full flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">{episode.name}</h1>
				<div className="flex flex-wrap gap-2">
					<Link
						to="/tv/$tvId/season/$seasonNumber"
						params={{
							tvId: tvId.toString(),
							seasonNumber: episode.season_number.toString(),
						}}
						className={badgeVariants({ variant: "secondary" })}
					>
						{m.vibrant_pink_violin({ seasonNumber: episode.season_number })}
					</Link>
					<Badge variant="secondary">
						{m.bubbly_fuchsia_puma({ episodeNumber: episode.episode_number })}
					</Badge>
				</div>
				<MediaCreators
					creators={directors}
					formatCredit={m.lively_coral_bamboo}
					media={creditsMedia}
				/>
				<MediaCreators
					creators={writers}
					formatCredit={m.fierce_olive_tiger}
					media={creditsMedia}
				/>
			</div>

			{episode.overview ? (
				<p className="text-sm lg:text-base whitespace-pre-line text-pretty leading-relaxed">
					{episode.overview}
				</p>
			) : null}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{episode.vote_count > 0 ? (
					<Card>
						<CardContent className="flex items-center gap-4">
							<IconStarFilled className="h-5 w-5 text-yellow-500" />
							<div>
								<p className="text-xl xl:text-2xl font-bold">
									{episode.vote_average.toFixed(1)}
								</p>
								<p className="text-sm text-muted-foreground">
									{m.chilly_saffron_galaxy({ count: episode.vote_count })}
								</p>
							</div>
						</CardContent>
					</Card>
				) : null}

				<Card>
					<CardContent className="flex items-center gap-4">
						<IconClock className="h-5 w-5" />
						<div>
							<p className="text-xl xl:text-2xl font-bold">
								{formatRuntime(episode.runtime)}
							</p>
							<p className="text-sm text-muted-foreground">
								{m.eager_khaki_dune()}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center gap-4">
						<IconCalendarWeekFilled className="h-5 w-5" />
						<div>
							<p className="text-xl xl:text-2xl font-bold">
								{episode.air_date
									? formatDate(episode.air_date, localeRegion, {
											year: "numeric",
											month: "short",
											day: "numeric",
										})
									: "N/A"}
							</p>
							<p className="text-sm text-muted-foreground">
								{m.lean_maroon_coral()}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{mergedCast.length > 0 && (
				<div className="flex flex-col gap-2 overflow-hidden">
					<CastList people={mergedCast} />
					<Link
						to="/tv/$tvId/season/$seasonNumber/episode/$episodeNumber/credits"
						params={{
							tvId: tvId.toString(),
							seasonNumber: episode.season_number.toString(),
							episodeNumber: episode.episode_number.toString(),
						}}
					>
						{m.elegant_gold_violin()}
					</Link>
				</div>
			)}
		</div>
	);
}
