import { IconChevronLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { Fragment, type ReactNode } from "react";
import type { Schemas } from "shared";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { MediaInfoTabs } from "@/components/medias/media-info-tabs";
import { EpisodeCreators } from "@/components/tv/episodes/episode-creators";
import { EpisodeNavigation } from "@/components/tv/episodes/episode-navigation";
import { buttonVariants } from "@/components/ui/button";
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

	const seasonParams = {
		tvId: tvId.toString(),
		seasonNumber: episode.season_number.toString(),
	};

	const crew = credits?.crew ?? episode.crew;
	const directors = uniqueById(
		crew.filter((person) => person.job === "Director"),
	);
	const writers = uniqueById(
		crew.filter((person) => WRITER_JOBS.has(person.job)),
	);

	// Main cast first, then the episode's guest stars.
	const cast = [
		...(credits?.cast ?? []),
		...(credits?.guest_stars ?? episode.guest_stars),
	].map((member) => ({ ...member, cast_id: member.id }));

	const meta: Array<{ id: string; content: ReactNode }> = [
		{
			id: "season",
			content: (
				<Link
					to="/tv/$tvId/season/$seasonNumber"
					params={seasonParams}
					className="text-foreground hover:underline underline-offset-4"
				>
					{m.vibrant_pink_violin({ seasonNumber: episode.season_number })}
				</Link>
			),
		},
		{
			id: "episode",
			content: m.bubbly_fuchsia_puma({ episodeNumber: episode.episode_number }),
		},
	];
	if (episode.runtime) {
		meta.push({ id: "runtime", content: formatRuntime(episode.runtime) });
	}
	if (episode.air_date) {
		meta.push({
			id: "air-date",
			content: (
				<time dateTime={episode.air_date}>
					{formatDate(episode.air_date, localeRegion, {
						year: "numeric",
						month: "short",
						day: "numeric",
					})}
				</time>
			),
		});
	}

	return (
		<div className="w-full flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-2">
					<Link
						to="/tv/$tvId/season/$seasonNumber"
						params={seasonParams}
						className={buttonVariants({
							variant: "ghost",
							size: "sm",
							className: "-ml-2 w-fit text-muted-foreground",
						})}
					>
						<IconChevronLeft data-icon="inline-start" />
						{m.breezy_sienna_iguana()}
					</Link>
					<EpisodeNavigation
						tvId={tvId}
						seasonNumber={episode.season_number}
						episodeNumber={episode.episode_number}
					/>
				</div>
				<h1 className="text-2xl font-bold">{episode.name}</h1>
				<p className="flex flex-wrap items-center gap-x-2 text-sm lg:text-base text-muted-foreground">
					{meta.map((item, index) => (
						<Fragment key={item.id}>
							{index > 0 ? <span aria-hidden>·</span> : null}
							<span>{item.content}</span>
						</Fragment>
					))}
				</p>
				<EpisodeCreators directors={directors} writers={writers} />
			</div>

			{episode.overview ? (
				<p className="text-sm lg:text-base whitespace-pre-line text-pretty leading-relaxed">
					{episode.overview}
				</p>
			) : null}

			<MediaInfoTabs
				key={episode.id}
				cast={cast}
				crew={crew}
				genres={[]}
				facts={[]}
				media={{
					type: "episode",
					tvId,
					seasonNumber: episode.season_number,
					episodeNumber: episode.episode_number,
				}}
			/>
		</div>
	);
}
