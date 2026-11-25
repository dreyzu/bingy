import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useAtomValue } from "jotai";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-date";
import { formatRuntime } from "@/utils/format-runtime";

interface CreditEpisodeCardProps {
	episode: {
		id: number;
		name: string;
		season_number: number;
		episode_number: number;
		still_path: string | null;
		overview: string | null;
		runtime: number | null;
		air_date: string | null;
	};
	tvId: number;
	isGuestAppearance: boolean;
}

export const CreditEpisodeCard = ({
	episode,
	tvId,
	isGuestAppearance,
}: CreditEpisodeCardProps) => {
	const localeRegion = useAtomValue(localeRegionAtom);
	const backgroundImage = episode.still_path
		? `https://image.tmdb.org/t/p/w500${episode.still_path}`
		: null;

	const getAirDateText = () => {
		if (!episode.air_date) {
			return m.sunny_fuchsia_galaxy();
		}

		const airDate = new Date(episode.air_date);
		const isUpcoming = airDate > new Date();
		const formattedDate = formatDate(episode.air_date, localeRegion);

		return isUpcoming
			? m.happy_slate_marmot({ date: formattedDate })
			: m.jaunty_pink_gecko({ date: formattedDate });
	};

	return (
		<Link
			to="/tv/$tvId/season/$seasonNumber/episode/$episodeNumber"
			params={{
				tvId: tvId.toString(),
				seasonNumber: episode.season_number.toString(),
				episodeNumber: episode.episode_number.toString(),
			}}
			className="group/episode block rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
		>
			<Card
				className={cn(
					"relative overflow-hidden rounded-md transition-colors",
					backgroundImage
						? "text-dark-card-foreground min-h-50"
						: "text-foreground border group-hover/episode:bg-accent",
				)}
				style={
					backgroundImage
						? {
								backgroundImage: `url(${backgroundImage})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}
						: undefined
				}
			>
				{backgroundImage ? (
					<div
						aria-hidden
						className="absolute inset-0 bg-black/80 transition-colors group-hover/episode:bg-black/70"
					/>
				) : null}
				<CardHeader className="relative">
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-2 flex-1">
							<CardTitle className="font-bold">{episode.name}</CardTitle>
							{episode.runtime ? (
								<Badge variant="secondary">
									{formatRuntime(episode.runtime)}
								</Badge>
							) : null}
							{isGuestAppearance ? (
								<Badge variant="default">{m.alert_pearl_heron()}</Badge>
							) : null}
						</div>
						<div className="text-sm whitespace-nowrap">
							{episode.season_number}x{episode.episode_number}
						</div>
					</div>
					{episode.overview ? (
						<CardDescription
							className={`w-full xl:max-w-2/3 ${
								backgroundImage
									? "text-dark-card-foreground"
									: "text-muted-foreground"
							}`}
						>
							{episode.overview}
						</CardDescription>
					) : null}
				</CardHeader>
				<CardContent className="relative flex flex-col gap-1 mt-auto">
					<p className="text-sm">{getAirDateText()}</p>
				</CardContent>
			</Card>
		</Link>
	);
};
