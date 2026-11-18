import { useState } from "react";
import type { Schemas } from "shared";
import {
	type CreditsMedia,
	MediaCreditsLink,
} from "@/components/medias/media-credits-link";
import { type MediaFact, MediaFactList } from "@/components/medias/media-facts";
import { MediaGenresBadge } from "@/components/medias/media-genres-badge";
import { CastList } from "@/components/person/cast-list";
import { CrewList } from "@/components/person/crew-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import { uniqueCastMembers, uniqueCrewMembers } from "@/utils/utils";

type MediaInfoTab = "cast" | "crew" | "genres" | "details";

interface MediaInfoTabsProps {
	cast: Array<Schemas.CastMember & { characters?: string[] }>;
	crew: Array<Schemas.CrewMember & { jobs?: string[] }>;
	genres: Schemas.Genre[];
	facts: MediaFact[];
	media: CreditsMedia;
}

/**
 * Cast, crew, genres, and details of a movie or TV show. Empty tabs are
 * hidden. The full credits link shows on the cast and crew tabs, and lands on
 * the crew section from the crew tab.
 */
export function MediaInfoTabs({
	cast: castCredits,
	crew: crewCredits,
	genres,
	facts,
	media,
}: MediaInfoTabsProps) {
	// A person can be credited several times (multiple roles or jobs); show
	// them once with all their roles merged.
	const cast = uniqueCastMembers(castCredits);
	const crew = uniqueCrewMembers(crewCredits);

	const availableTabs = (
		[
			["cast", cast.length > 0],
			["crew", crew.length > 0],
			["genres", genres.length > 0],
			["details", facts.length > 0],
		] as const
	)
		.filter(([, available]) => available)
		.map(([tab]) => tab);

	const [selectedTab, setSelectedTab] = useState<MediaInfoTab>();

	const tab =
		selectedTab && availableTabs.includes(selectedTab)
			? selectedTab
			: availableTabs[0];

	if (!tab) return null;

	return (
		<div className="flex flex-col gap-2">
			<Tabs
				value={tab}
				onValueChange={(value: MediaInfoTab) => setSelectedTab(value)}
				className="w-full m-0 gap-4"
			>
				<TabsList variant="line" className="gap-4">
					{availableTabs.includes("cast") ? (
						<TabsTrigger value="cast" className="px-0">
							{m.wise_magenta_ember()}
						</TabsTrigger>
					) : null}
					{availableTabs.includes("crew") ? (
						<TabsTrigger value="crew" className="px-0">
							{m.dreamy_coral_basil()}
						</TabsTrigger>
					) : null}
					{availableTabs.includes("genres") ? (
						<TabsTrigger value="genres" className="px-0">
							{m.steady_saffron_fox()}
						</TabsTrigger>
					) : null}
					{availableTabs.includes("details") ? (
						<TabsTrigger value="details" className="px-0">
							{m.epic_lemon_anchor()}
						</TabsTrigger>
					) : null}
				</TabsList>
				<TabsContent value="cast" className="p-0.75">
					<CastList people={cast} />
				</TabsContent>
				<TabsContent value="crew" className="p-0.75">
					<CrewList people={crew} />
				</TabsContent>
				<TabsContent value="genres" className="p-0.75">
					<MediaGenresBadge genres={genres} />
				</TabsContent>
				<TabsContent value="details" className="p-0.75">
					<MediaFactList facts={facts} />
				</TabsContent>
			</Tabs>
			{tab === "cast" || tab === "crew" ? (
				<MediaCreditsLink
					media={media}
					section={tab === "crew" ? "crew" : undefined}
					className="text-sm"
				>
					{m.elegant_gold_violin()}
				</MediaCreditsLink>
			) : null}
		</div>
	);
}
