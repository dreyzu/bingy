import {
	IconCalendarWeekFilled,
	IconDeviceTv,
	IconStack2,
} from "@tabler/icons-react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { MediaActionMenu } from "@/components/lists/media-actions/media-action-menu";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { MediaCreators } from "@/components/medias/media-creators";
import {
	MEDIA_DETAILS_POSTER_CLASSES,
	MediaDetailsLayout,
} from "@/components/medias/media-details-layout";
import { MediaDetailsOverview } from "@/components/medias/media-details-overview";
import { MediaInfoTabs } from "@/components/medias/media-info-tabs";
import { MediaLearnMoreCard } from "@/components/medias/media-learn-more";
import { MediaRatingDisplayCard } from "@/components/medias/media-rating-display-card";
import { MediaTitle } from "@/components/medias/media-title";
import { PortraitImage } from "@/components/portrait-image";
import { TVStatusCard } from "@/components/tv/tv-details/status-card";
import { getTvFacts } from "@/components/tv/tv-facts";
import { Card, CardContent } from "@/components/ui/card";
import { WatchProvidersSection } from "@/components/watch-providers/watch-providers-section";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-date";
import { getTmdbImageUrl } from "@/utils/utils";

interface TvDetailViewProps {
	tv: Schemas.TvDetails | undefined;
	watchProviders: Schemas.WatchProviders | undefined;
	cast: Array<Schemas.CastMember & { characters?: string[] }>;
	crew: Array<Schemas.CrewMember & { jobs?: string[] }>;
	isLoading: boolean;
	isError: boolean;
}

export function TvDetailsView({
	tv,
	watchProviders,
	cast,
	crew,
	isLoading,
	isError,
}: TvDetailViewProps) {
	const { authData } = useRouteContext({ from: "__root__" });
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);

	if (isLoading) {
		return <LoadingCentered />;
	}

	if (isError || !tv) {
		return (
			<ResourceNotFound
				title={m.brave_pearl_willow()}
				description={m.agile_scarlet_compass()}
			/>
		);
	}

	const backgroundImage = getTmdbImageUrl(tv.backdrop_path);

	return (
		<MediaDetailsLayout
			backgroundImage={backgroundImage}
			poster={
				<PortraitImage
					imagePath={tv.poster_path}
					alt={tv.name}
					imageSize="w500"
					category="tv"
					className={MEDIA_DETAILS_POSTER_CLASSES}
				/>
			}
			watchProviders={
				watchProviders ? (
					<WatchProvidersSection
						watchProviders={watchProviders}
						region={region}
						className="w-full"
					/>
				) : null
			}
			header={
				<Card className="shadow-none bg-transparent border-none ring-0 p-0">
					<CardContent className="p-0">
						<div className="flex flex-col gap-4 px-0.5 py-0.5">
							<MediaTitle
								title={tv.name}
								releaseDate={tv.first_air_date}
								originalTitle={tv.original_name}
							/>

							<MediaCreators
								creators={tv.created_by}
								formatCredit={m.elegant_lilac_mesa}
								media={{ type: "tv", id: tv.id }}
							/>
						</div>
					</CardContent>
				</Card>
			}
			actions={
				authData ? (
					<MediaActionMenu
						username={authData.user.name}
						tvShow={{
							id: tv.id,
							name: tv.name,
							posterPath: tv.poster_path,
							releaseDate: tv.first_air_date,
							mediaType: "tv",
						}}
						posterPath={tv.poster_path}
					/>
				) : null
			}
			overview={
				<div className="flex flex-col gap-1">
					{tv.tagline ? (
						<p className="font-bold italic text-base lg:text-lg">
							{tv.tagline}
						</p>
					) : null}
					<MediaDetailsOverview overview={tv.overview} />
				</div>
			}
			stats={
				<div className="grid lg:grid-cols-3 gap-3 p-px">
					<MediaRatingDisplayCard mediaType="tv" tmdbId={tv.id} />

					<Card>
						<CardContent className="flex items-center gap-4">
							<IconCalendarWeekFilled />
							<div>
								<p className="text-lg font-bold">
									{tv.first_air_date
										? formatDate(tv.first_air_date, localeRegion, {
												year: "numeric",
												month: "short",
												day: "numeric",
											})
										: "N/A"}
								</p>
								<p className="text-sm text-muted-foreground">
									{m.mellow_lilac_anchor()}
								</p>
							</div>
						</CardContent>
					</Card>

					<TVStatusCard status={tv.status} />

					<Link to="/tv/$tvId/seasons" params={{ tvId: tv.id.toString() }}>
						<Card>
							<CardContent className="flex items-center gap-4">
								<IconDeviceTv />
								<div>
									<p className="text-lg font-bold">{tv.number_of_seasons}</p>
									<p className="text-sm text-muted-foreground">
										{m.lean_crimson_puma({ count: tv.number_of_seasons })}
									</p>
								</div>
							</CardContent>
						</Card>
					</Link>

					<Card>
						<CardContent className="flex items-center gap-4">
							<IconStack2 />
							<div>
								<p className="text-lg font-bold">{tv.number_of_episodes}</p>
								<p className="text-sm text-muted-foreground">
									{m.warm_scarlet_jasmine({ count: tv.number_of_episodes })}
								</p>
							</div>
						</CardContent>
					</Card>

					{tv.id ? <MediaLearnMoreCard id={tv.id} mediaType="tv" /> : null}
				</div>
			}
			infoTabs={
				<MediaInfoTabs
					key={tv.id}
					cast={cast}
					crew={crew}
					genres={tv.genres}
					facts={getTvFacts(tv, { locale: localeRegion, region })}
					media={{ type: "tv", id: tv.id }}
				/>
			}
		/>
	);
}
