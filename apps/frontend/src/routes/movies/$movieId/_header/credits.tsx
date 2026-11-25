import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import type { Schemas } from "shared";
import { creditsSearchSchema } from "@/components/credits/crew-section";
import { MovieCreditsView } from "@/components/movies/movie-credits";
import { useMovieResource } from "@/hooks/useMovies";
import { localeRegionAtom } from "@/lib/atoms/region";

export const Route = createFileRoute("/movies/$movieId/_header/credits")({
	validateSearch: creditsSearchSchema,
	component: MovieCreditsPage,
});

function MovieCreditsPage() {
	const { movieId } = Route.useParams();
	const { section } = Route.useSearch();
	const localeRegion = useAtomValue(localeRegionAtom);

	const {
		data: credits,
		isLoading,
		isError,
	} = useMovieResource<Schemas.MovieCreditsWithTitle>(
		Number(movieId),
		"credits",
		{
			language: localeRegion,
		},
	);

	return (
		<MovieCreditsView
			movieId={Number(movieId)}
			credits={credits}
			section={section}
			isLoading={isLoading}
			isError={isError}
		/>
	);
}
