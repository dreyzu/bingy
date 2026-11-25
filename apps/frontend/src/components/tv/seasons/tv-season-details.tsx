import { IconChevronLeft, IconStopwatch } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { getYear } from "date-fns";
import { useAtomValue } from "jotai";
import { Fragment, type ReactNode } from "react";
import type { Schemas } from "shared";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { MediaDetailsOverview } from "@/components/medias/media-details-overview";
import { FactBadges, type MediaFact } from "@/components/medias/media-facts";
import {
	type ExtraInfoTab,
	MediaInfoTabs,
} from "@/components/medias/media-info-tabs";
import { PortraitImage } from "@/components/portrait-image";
import { EpisodesContainer } from "@/components/tv/episodes/episodes-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import {
	toCastWithCharacters,
	toCrewWithJobs,
} from "@/utils/aggregate-credits";
import { formatDate } from "@/utils/format-date";
import { formatRuntimeHours } from "@/utils/format-runtime";

interface TvSeasonDetailsViewProps {
	tvSeason: Schemas.TvSeasonDetails | undefined;
	credits: Schemas.TvAggregatedCredits | undefined;
	tvId: number;
	isLoading: boolean;
	isError: boolean;
}

export function TvSeasonDetailsView({
	tvSeason,
	credits,
	tvId,
	isLoading,
	isError,
}: TvSeasonDetailsViewProps) {
	const localeRegion = useAtomValue(localeRegionAtom);

	if (isLoading) {
		return <LoadingCentered />;
	}

	if (isError || !tvSeason) {
		return (
			<ResourceNotFound
				title={m.steady_ruby_mesa()}
				description={m.quiet_sepia_spruce()}
			/>
		);
	}

	const uniqueNetworks = tvSeason.networks.filter(
		(network, index, self) =>
			index === self.findIndex((n) => n.id === network.id),
	);

	// Aggregate cast can leave out one-off guests, so add each episode's.
	const guestStars = tvSeason.episodes.flatMap((episode) =>
		(episode.guest_stars ?? []).map((guest) => ({
			...guest,
			cast_id: guest.id,
		})),
	);
	const cast = [...toCastWithCharacters(credits?.cast ?? []), ...guestStars];
	const crew = toCrewWithJobs(credits?.crew ?? []);

	const hasRuntime = tvSeason.episodes.some((ep) => ep.runtime);
	const totalRuntimeHours = formatRuntimeHours(
		tvSeason.episodes.reduce((total, ep) => total + (ep.runtime || 0), 0),
	);

	const seasonLabel = m.brave_khaki_island({
		seasonNumber: tvSeason.season_number,
	});
	// The title already says "Season N" unless the season has its own name.
	const hasOwnName = tvSeason.name.toLowerCase() !== seasonLabel.toLowerCase();
	const firstAirDate = tvSeason.episodes[0]?.air_date ?? tvSeason.air_date;

	const meta: Array<{ id: string; content: ReactNode }> = [];
	if (hasOwnName) {
		meta.push({ id: "season", content: seasonLabel });
	}
	if (firstAirDate) {
		meta.push({ id: "year", content: getYear(firstAirDate) });
	}
	if (tvSeason.episodes.length > 0) {
		meta.push({
			id: "episodes",
			content: m.witty_coral_tulip({ count: tvSeason.episodes.length }),
		});
	}

	const formatAirDate = (date: string) =>
		formatDate(date, localeRegion, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	const lastAirDate = tvSeason.episodes.at(-1)?.air_date;

	const facts: MediaFact[] = [];
	if (uniqueNetworks.length > 0) {
		facts.push({
			id: "networks",
			label: m.stellar_bronze_comet({ count: uniqueNetworks.length }),
			value: (
				<FactBadges
					items={uniqueNetworks.map((network) => ({
						key: network.id,
						label: network.name,
					}))}
				/>
			),
		});
	}
	if (firstAirDate) {
		facts.push({
			id: "premiere",
			label: m.bubbly_onyx_heron(),
			value: formatAirDate(firstAirDate),
		});
	}
	if (lastAirDate && tvSeason.episodes.length > 1) {
		facts.push({
			id: "finale",
			label: m.noble_indigo_cherry(),
			value: formatAirDate(lastAirDate),
		});
	}

	const extraTabs: ExtraInfoTab[] = tvSeason.poster_path
		? [
				{
					id: "poster",
					label: m.keen_sienna_spruce(),
					content: (
						<PortraitImage
							imagePath={tvSeason.poster_path}
							alt={tvSeason.name}
							imageSize="w500"
							category="tv"
							className="w-40 sm:w-48 md:w-48 lg:w-56 2xl:w-56"
						/>
					),
				},
			]
		: [];

	return (
		<div className="w-full flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Link
					to="/tv/$tvId/seasons"
					params={{ tvId: tvId.toString() }}
					className={buttonVariants({
						variant: "ghost",
						size: "sm",
						className: "-ml-2 w-fit text-muted-foreground",
					})}
				>
					<IconChevronLeft data-icon="inline-start" />
					{m.zesty_cerise_prairie()}
				</Link>
				<div className="flex items-center justify-between gap-3">
					<h1 className="text-2xl font-bold">{tvSeason.name}</h1>
					{hasRuntime ? (
						<Badge variant="default" className="shrink-0 gap-1">
							<IconStopwatch className="h-4 w-4" />
							<span>{totalRuntimeHours}</span>
						</Badge>
					) : null}
				</div>
				{meta.length > 0 ? (
					<p className="flex flex-wrap items-center gap-x-2 text-sm lg:text-base text-muted-foreground">
						{meta.map((item, index) => (
							<Fragment key={item.id}>
								{index > 0 ? <span aria-hidden>·</span> : null}
								<span>{item.content}</span>
							</Fragment>
						))}
					</p>
				) : null}
			</div>

			{tvSeason.overview ? (
				<MediaDetailsOverview overview={tvSeason.overview} />
			) : null}

			{tvSeason.episodes.length > 0 ? (
				<EpisodesContainer episodes={tvSeason.episodes} />
			) : null}

			<MediaInfoTabs
				key={tvSeason.id}
				cast={cast}
				crew={crew}
				genres={[]}
				facts={facts}
				media={{
					type: "season",
					tvId,
					seasonNumber: tvSeason.season_number,
				}}
				extraTabs={extraTabs}
			/>
		</div>
	);
}
