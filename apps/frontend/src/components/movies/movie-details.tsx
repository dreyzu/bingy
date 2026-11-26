import { IconCalendarWeekFilled } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { CollectionCard } from "@/components/collections/collection-card";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { MediaActionMenu } from "@/components/lists/media-actions/media-action-menu";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { MediaArtworkButton } from "@/components/medias/media-artwork-button";
import { MediaCreators } from "@/components/medias/media-creators";
import {
	MEDIA_DETAILS_POSTER_CLASSES,
	MediaDetailsLayout,
} from "@/components/medias/media-details-layout";
import { MediaDetailsOverview } from "@/components/medias/media-details-overview";
import { MediaInfoTabs } from "@/components/medias/media-info-tabs";
import { MediaLearnMoreCard } from "@/components/medias/media-learn-more";
import { MediaRatingDisplayCard } from "@/components/medias/media-rating-display-card";
import { MediaReleaseYear } from "@/components/medias/media-release-year";
import { MediaTitle } from "@/components/medias/media-title";
import { MediaTrailerButton } from "@/components/medias/media-trailer-button";
import { getMovieFacts } from "@/components/movies/movie-facts";
import { PortraitImage } from "@/components/portrait-image";
import { Card, CardContent } from "@/components/ui/card";
import { WatchProvidersSection } from "@/components/watch-providers/watch-providers-section";
import { useSession } from "@/hooks/useSession";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-date";
import { formatRuntime } from "@/utils/format-runtime";
import { getTmdbImageUrl } from "@/utils/utils";

interface MovieDetailViewProps {
	movie: Schemas.MovieDetails | undefined;
	directors: Array<{ id: number; name: string; gender: number | null }>;
	cast: Schemas.CastMember[];
	crew: Schemas.CrewMember[];
	watchProviders: Schemas.WatchProviders | undefined;
	collection: Schemas.MovieDetails["belongs_to_collection"] | undefined;
	releaseDate: string | undefined;
	releaseRegion: string | undefined;
	isLoading: boolean;
	isError: boolean;
}

export function MovieDetailView({
	movie,
	cast,
	crew,
	directors,
	watchProviders,
	collection,
	releaseDate,
	releaseRegion,
	isLoading,
	isError,
}: MovieDetailViewProps) {
	const session = useSession();
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);

	if (isLoading) {
		return <LoadingCentered />;
	}

	if (isError || !movie) {
		return (
			<ResourceNotFound
				title={m.balmy_teal_oasis()}
				description={m.balmy_copper_koala()}
			/>
		);
	}

	const backgroundImage = getTmdbImageUrl(movie.backdrop_path, "original");

	return (
		<MediaDetailsLayout
			backgroundImage={backgroundImage}
			poster={
				<PortraitImage
					imagePath={movie.poster_path}
					alt={movie.title}
					imageSize="w500"
					category="movie"
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
						<div className="flex flex-col gap-2 px-0.5 py-0.5">
							<MediaTitle
								title={movie.title}
								originalTitle={movie.original_title}
							/>

							<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
								<MediaReleaseYear releaseDate={movie.release_date} />
								<MediaCreators
									creators={directors}
									formatCredit={m.swift_saffron_daisy}
									media={{ type: "movie", id: movie.id }}
								/>
							</div>

							<div className="flex flex-wrap items-center gap-3">
								<MediaTrailerButton videos={movie.videos?.results} />
								<MediaArtworkButton mediaType="movie" tmdbId={movie.id} />
								{movie.runtime ? (
									<span className="text-sm text-muted-foreground">
										{formatRuntime(movie.runtime)}
									</span>
								) : null}
							</div>
						</div>
					</CardContent>
				</Card>
			}
			actions={
				session ? (
					<MediaActionMenu
						username={session.user.name}
						movie={{
							id: movie.id,
							title: movie.title,
							posterPath: movie.poster_path,
							releaseDate: movie.release_date,
							mediaType: "movie",
						}}
						posterPath={movie.poster_path}
					/>
				) : null
			}
			overview={
				<div className="flex flex-col gap-1">
					{movie.tagline ? (
						<p className="font-bold italic text-base lg:text-lg">
							{movie.tagline}
						</p>
					) : null}
					<MediaDetailsOverview overview={movie.overview} />
				</div>
			}
			stats={
				<div className="grid lg:grid-cols-3 gap-2 p-px">
					<MediaRatingDisplayCard mediaType="movie" tmdbId={movie.id} />

					<Card>
						<CardContent className="flex items-center gap-4">
							<IconCalendarWeekFilled />
							<div>
								<p className="text-lg font-bold">
									{releaseDate
										? formatDate(releaseDate, localeRegion, {
												day: "numeric",
												month: "short",
												year: "numeric",
											})
										: "N/A"}
								</p>
								<p className="text-sm text-muted-foreground flex items-center gap-2">
									{releaseRegion ? (
										<span
											className={`fi fi-${releaseRegion.toLowerCase()}`}
											style={{ width: 18, height: 14 }}
										/>
									) : null}
									{m.dapper_beige_cherry()}
								</p>
							</div>
						</CardContent>
					</Card>

					{movie.id ? (
						<MediaLearnMoreCard id={movie.id} mediaType="movie" />
					) : null}
				</div>
			}
			infoTabs={
				<MediaInfoTabs
					key={movie.id}
					cast={cast}
					crew={crew}
					genres={movie.genres}
					facts={getMovieFacts(movie, { locale: localeRegion, region })}
					media={{ type: "movie", id: movie.id }}
				/>
			}
		>
			{collection ? <CollectionCard collection={collection} /> : null}
		</MediaDetailsLayout>
	);
}
