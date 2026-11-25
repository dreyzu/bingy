import type { Schemas } from "shared";
import { m } from "@/paraglide/messages";
import { CreditEpisodeCard } from "./credit-episode-card";

interface CreditEpisodesListProps {
	tvId: number;
	personName: string;
	character: string;
	job?: string;
	guestEpisodeIds: Set<number>;
	episodes: Omit<Schemas.Episode, "media_type">[];
}

export const CreditEpisodesList = ({
	tvId,
	personName,
	character,
	job,
	guestEpisodeIds,
	episodes,
}: CreditEpisodesListProps) => {
	const role = character || job || m.balmy_jade_forest();

	return (
		<div className="w-full flex flex-col gap-4">
			<h1 className="text-xl text-muted-foreground">
				<span className="text-foreground">{personName}</span>{" "}
				{m.happy_hazel_compass({ role: role })}
			</h1>

			{episodes.map((episode) => (
				<CreditEpisodeCard
					key={episode.id}
					episode={episode}
					tvId={tvId}
					isGuestAppearance={
						character ? guestEpisodeIds.has(episode.id) : false
					}
				/>
			))}
		</div>
	);
};
