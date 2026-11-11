import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { NowPlayingMovies } from "@/components/movies/now-playing";
import { PopularMovies } from "@/components/movies/popular";
import { TopRatedMovies } from "@/components/movies/top-rated";
import { UpcomingMovies } from "@/components/movies/upcoming";
import {
	useNowPlayingMovies,
	usePopularMovies,
	useTopRatedMovies,
	useUpcomingMovies,
} from "@/hooks/useMovies";
import { localeRegionAtom, regionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/movies/")({
	component: MoviesPage,
});

function MoviesPage() {
	const localeRegion = useAtomValue(localeRegionAtom);
	const region = useAtomValue(regionAtom);

	const {
		data: nowPlayingMovies,
		isLoading: nowPlayingLoading,
		isError: nowPlayingError,
	} = useNowPlayingMovies({
		region,
		language: localeRegion,
	});

	const {
		data: topRatedMovies,
		isLoading: topRatedLoading,
		isError: topRatedError,
	} = useTopRatedMovies({
		region,
		language: localeRegion,
	});

	const {
		data: upcomingMovies,
		isLoading: upcomingLoading,
		isError: upcomingError,
	} = useUpcomingMovies({
		region,
		language: localeRegion,
	});

	const {
		data: popularMovies,
		isLoading: popularLoading,
		isError: popularError,
	} = usePopularMovies({
		region,
		language: localeRegion,
	});

	return (
		<div className="flex flex-col w-full gap-4">
			<NowPlayingMovies
				title={m.mighty_rose_heron()}
				movies={nowPlayingMovies}
				isLoading={nowPlayingLoading}
				isError={nowPlayingError}
			/>
			<UpcomingMovies
				title={m.lucky_amber_nectar()}
				movies={upcomingMovies}
				isLoading={upcomingLoading}
				isError={upcomingError}
			/>
			<PopularMovies
				title={m.balmy_mint_acorn()}
				movies={popularMovies}
				isLoading={popularLoading}
				isError={popularError}
			/>
			<TopRatedMovies
				title={m.winsome_coral_clover()}
				movies={topRatedMovies}
				isLoading={topRatedLoading}
				isError={topRatedError}
			/>
		</div>
	);
}
