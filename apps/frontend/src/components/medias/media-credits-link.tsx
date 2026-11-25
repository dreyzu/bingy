import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { CreditsSection } from "@/components/credits/crew-section";

export type CreditsMedia =
	| {
			type: "movie" | "tv";
			id: number;
	  }
	| {
			type: "season";
			tvId: number;
			seasonNumber: number;
	  }
	| {
			type: "episode";
			tvId: number;
			seasonNumber: number;
			episodeNumber: number;
	  };

interface MediaCreditsLinkProps {
	media: CreditsMedia;
	/** Section of the credits page to land on. Ignored for seasons and episodes. */
	section?: CreditsSection;
	className?: string;
	title?: string;
	"aria-label"?: string;
	children: ReactNode;
}

/** Link to the full credits page of a movie, TV show, season or episode. */
export function MediaCreditsLink({
	media,
	section,
	...linkProps
}: MediaCreditsLinkProps) {
	if (media.type === "season") {
		return (
			<Link
				to="/tv/$tvId/season/$seasonNumber/credits"
				params={{
					tvId: media.tvId.toString(),
					seasonNumber: media.seasonNumber.toString(),
				}}
				{...linkProps}
			/>
		);
	}

	if (media.type === "episode") {
		return (
			<Link
				to="/tv/$tvId/season/$seasonNumber/episode/$episodeNumber/credits"
				params={{
					tvId: media.tvId.toString(),
					seasonNumber: media.seasonNumber.toString(),
					episodeNumber: media.episodeNumber.toString(),
				}}
				{...linkProps}
			/>
		);
	}

	const id = media.id.toString();

	return media.type === "movie" ? (
		<Link
			to="/movies/$movieId/credits"
			params={{ movieId: id }}
			search={{ section }}
			{...linkProps}
		/>
	) : (
		<Link
			to="/tv/$tvId/credits"
			params={{ tvId: id }}
			search={{ section }}
			{...linkProps}
		/>
	);
}
