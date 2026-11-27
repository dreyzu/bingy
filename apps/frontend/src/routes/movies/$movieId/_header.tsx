import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { getBackdropFocusY } from "@/api/artwork";
import { MediaHeaderLayout } from "@/components/medias/media-header-layout";
import { useMovie, useMovieResource } from "@/hooks/useMovies";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";
import { getTmdbImageUrl } from "@/utils/utils";

export const Route = createFileRoute("/movies/$movieId/_header")({
	component: MovieHeaderLayout,
});

function MovieHeaderLayout() {
	const { movieId } = Route.useParams();
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);

	const { data: movie, isLoading } = useMovie(Number(movieId), {
		language: localeRegion,
	});

	const { data: watchProviders } = useMovieResource<Schemas.WatchProviders>(
		Number(movieId),
		"watch/providers",
	);

	return (
		<MediaHeaderLayout
			media={
				movie
					? {
							type: "movie",
							id: movie.id,
							title: movie.title,
							posterPath: movie.poster_path,
							releaseDate: movie.release_date,
						}
					: undefined
			}
			isLoading={isLoading}
			watchProviders={watchProviders}
			region={region}
			backgroundImage={getTmdbImageUrl(movie?.backdrop_path ?? null)}
			backgroundFocusY={getBackdropFocusY(movie)}
			isBackgroundLoading={isLoading}
		>
			<Outlet />
		</MediaHeaderLayout>
	);
}
