import type { Schemas } from "shared";
import { ResourceNotFound } from "@/components/errors/resource-not-found";
import { LoadingCentered } from "@/components/loading/loading-centered";
import { m } from "@/paraglide/messages";
import { SeasonCard } from "./season-card";

interface TvSeasonsDetailsViewProps {
	tv: Schemas.TvDetails | undefined;
	isLoading: boolean;
	isError: boolean;
}

export function TvSeasonsDetailsView({
	tv,
	isLoading,
	isError,
}: TvSeasonsDetailsViewProps) {
	if (isLoading) {
		return <LoadingCentered />;
	}

	if (isError || !tv) {
		return (
			<ResourceNotFound
				title={m.vivid_rust_sunflower()}
				description={m.epic_lemon_jaguar()}
			/>
		);
	}

	const regularSeasons = tv.seasons.filter(
		(season) => season.season_number > 0,
	);

	const specialSeason = tv.seasons.find((season) => season.season_number === 0);

	return (
		<div className="w-full">
			<div className="grid grid-cols-1 gap-4">
				<h1 className="text-2xl font-bold">{m.elegant_lemon_planet()}</h1>

				<div className="grid gap-4 xl:grid-cols-2">
					{regularSeasons.map((season) => (
						<SeasonCard key={season.id} season={season} tvId={tv.id} />
					))}
					{specialSeason && (
						<SeasonCard
							key={specialSeason.id}
							season={specialSeason}
							tvId={tv.id}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
