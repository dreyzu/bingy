import { getYear } from "date-fns";

interface MediaReleaseYearProps {
	releaseDate?: string | null;
}

export function MediaReleaseYear({ releaseDate }: MediaReleaseYearProps) {
	return releaseDate ? (
		<span className="text-base lg:text-xl font-semibold underline">
			{getYear(releaseDate)}
		</span>
	) : null;
}
