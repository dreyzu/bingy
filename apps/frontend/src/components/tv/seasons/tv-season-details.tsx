import {
	IconCalendarWeekFilled,
	IconChevronLeft,
	IconStack2,
	IconStarFilled,
	IconStopwatch,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { MediaDetailsOverview } from "@/components/medias/media-details-overview";
import { CastList } from "@/components/person/cast-list";
import { EpisodesContainer } from "@/components/tv/episodes/episodes-container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { formatRuntimeHours } from "@/utils/format-runtime";

interface TvSeasonDetailsViewProps {
	tvSeason: Schemas.TvSeasonDetails | undefined;
	credits: Schemas.TvCredits | undefined;
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

	const guestStars = Array.from(
		new Map(
			tvSeason.episodes
				.flatMap((ep) =>
					(ep.guest_stars ?? []).map((g) => ({
						...g,
						cast_id: g.id,
					})),
				)
				.map((p) => [p.id, p]),
		).values(),
	);

	const seasonCastMinimal: Schemas.CastMember[] =
		credits?.cast.map((p) => ({
			...p,
			cast_id: p.id,
		})) ?? [];

	const guestStarsMinimal: Schemas.CastMember[] = guestStars.map((g) => ({
		...g,
		cast_id: g.id,
	}));

	let mergedCast: Schemas.CastMember[] = [];

	if (seasonCastMinimal.length >= 10) {
		mergedCast = seasonCastMinimal
			.slice()
			.sort((a, b) => a.order - b.order)
			.slice(0, 10);
	} else if (seasonCastMinimal.length > 0) {
		const all = [...seasonCastMinimal, ...guestStarsMinimal];

		const byId = new Map<number, Schemas.CastMember>();

		for (const p of all) {
			const existing = byId.get(p.id);
			if (!existing) {
				byId.set(p.id, p);
			} else if (p.order < existing.order) {
				byId.set(p.id, p);
			}
		}

		mergedCast = Array.from(byId.values())
			.sort((a, b) => a.order - b.order)
			.slice(0, 10);
	} else {
		mergedCast = guestStarsMinimal
			.slice()
			.sort((a, b) => a.order - b.order)
			.slice(0, 10);
	}

	const hasRuntime = tvSeason.episodes.some((ep) => ep.runtime);
	const totalRuntimeHours = formatRuntimeHours(
		tvSeason.episodes.reduce((total, ep) => total + (ep.runtime || 0), 0),
	);

	const seasonLabel = m.brave_khaki_island({
		seasonNumber: tvSeason.season_number,
	});
	const showSeasonBadge =
		tvSeason.name.toLowerCase() !== seasonLabel.toLowerCase();

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
				{showSeasonBadge ? (
					<Badge variant="secondary" className="w-fit">
						{seasonLabel}
					</Badge>
				) : null}
			</div>

			{tvSeason.overview ? (
				<MediaDetailsOverview overview={tvSeason.overview} />
			) : null}

			<div className="grid lg:grid-cols-3 gap-3">
				<Card>
					<CardContent className="flex items-center gap-4">
						<IconStarFilled className="h-5 w-5 text-yellow-500" />
						<div>
							<p className="text-xl xl:text-2xl font-bold">
								{tvSeason.vote_average > 0
									? tvSeason.vote_average.toFixed(1)
									: "N/R"}
							</p>
							<p className="text-sm text-muted-foreground">
								{m.velvet_beige_blossom()}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center gap-4">
						<IconCalendarWeekFilled className="h-5 w-5" />
						<div>
							<p className="text-xl xl:text-2xl font-bold">
								{tvSeason.air_date
									? new Date(tvSeason.air_date).toLocaleDateString(
											localeRegion,
											{
												year: "numeric",
												month: "short",
												day: "numeric",
											},
										)
									: "N/A"}
							</p>
							<p className="text-sm text-muted-foreground">
								{m.cozy_lemon_forest()}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex items-center gap-4">
						<IconStack2 className="h-5 w-5" />
						<div>
							<p className="text-xl xl:text-2xl font-bold">
								{tvSeason.episodes.length}
							</p>
							<p className="text-sm text-muted-foreground">
								{m.witty_coral_tulip({
									count: tvSeason.episodes.length,
								})}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{tvSeason.episodes.length > 0 ? (
				<EpisodesContainer episodes={tvSeason.episodes} />
			) : null}

			{mergedCast.length > 0 ? (
				<div className="flex flex-col gap-2">
					<CastList people={mergedCast} />
					<Link
						to="/tv/$tvId/season/$seasonNumber/credits"
						params={{
							tvId: tvId.toString(),
							seasonNumber: tvSeason.season_number.toString(),
						}}
					>
						{m.elegant_gold_violin()}
					</Link>
				</div>
			) : null}

			{tvSeason.networks.length > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>
							{m.stellar_bronze_comet({
								count: tvSeason.networks.length,
							})}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-4">
						{uniqueNetworks.map((network) => (
							<Badge
								key={network.id}
								className="flex items-center gap-3"
								variant="outline"
							>
								{network.name}
							</Badge>
						))}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
