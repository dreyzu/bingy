import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { CreditsSection } from "@/components/credits/crew-section";

export interface CreditsMedia {
	type: "movie" | "tv";
	id: number;
}

interface MediaCreditsLinkProps {
	media: CreditsMedia;
	/** Section of the credits page to land on. */
	section?: CreditsSection;
	className?: string;
	title?: string;
	"aria-label"?: string;
	children: ReactNode;
}

/** Link to the full credits page of a movie or TV show. */
export function MediaCreditsLink({
	media,
	section,
	...linkProps
}: MediaCreditsLinkProps) {
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
