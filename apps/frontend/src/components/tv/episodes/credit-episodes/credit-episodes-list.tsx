import { Link } from "@tanstack/react-router";
import type { Schemas } from "shared";
import { CREATOR_LINK_CLASSES } from "@/components/medias/media-creators";
import { m } from "@/paraglide/messages";
import { CreditEpisodeCard } from "./credit-episode-card";

// Private-use character, so it never collides with translated text.
const NAME_PLACEHOLDER = String.fromCodePoint(0xe000);

interface CreditEpisodesListProps {
	tvId: number;
	person: { id: number; name: string };
	character: string;
	job?: string;
	guestEpisodeIds: Set<number>;
	episodes: Omit<Schemas.Episode, "media_type">[];
}

export const CreditEpisodesList = ({
	tvId,
	person,
	character,
	job,
	guestEpisodeIds,
	episodes,
}: CreditEpisodesListProps) => {
	const role = character || job || m.balmy_jade_forest();

	// The name is a link, so the message is rendered around it instead of
	// receiving it as plain text. This keeps the translated word order.
	const [before, after = ""] = m
		.humble_khaki_saddle({ name: NAME_PLACEHOLDER, role })
		.split(NAME_PLACEHOLDER);

	return (
		<div className="w-full flex flex-col gap-4">
			<h1 className="text-xl text-muted-foreground">
				{before}
				<Link
					to="/person/$personId"
					params={{ personId: person.id.toString() }}
					className={CREATOR_LINK_CLASSES}
				>
					{person.name}
				</Link>
				{after}
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
