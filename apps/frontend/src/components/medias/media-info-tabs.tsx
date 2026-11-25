import { type ReactNode, useState } from "react";
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

/** People shown per tab; the full credits page lists the rest. */
const MAX_PEOPLE = 10;

export interface ExtraInfoTab {
	id: string;
	label: string;
	content: ReactNode;
}

interface MediaInfoTabsProps {
	cast: Array<Schemas.CastMember & { characters?: string[] }>;
	crew: Array<Schemas.CrewMember & { jobs?: string[] }>;
	genres: Schemas.Genre[];
	facts: MediaFact[];
	media: CreditsMedia;
	/** Tabs shown after the standard ones, e.g. a season's poster. */
	extraTabs?: ExtraInfoTab[];
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
	extraTabs = [],
}: MediaInfoTabsProps) {
	// A person can be credited several times (multiple roles or jobs); show
	// them once with all their roles merged.
	const cast = uniqueCastMembers(castCredits);
	const crew = uniqueCrewMembers(crewCredits);
	// The full credits link only matters when the tab leaves people out.
	const hasMoreCredits = (tab: string) =>
		(tab === "cast" && cast.length > MAX_PEOPLE) ||
		(tab === "crew" && crew.length > MAX_PEOPLE);

	const availableTabs = [
		...(
			[
				["cast", cast.length > 0],
				["crew", crew.length > 0],
				["genres", genres.length > 0],
				["details", facts.length > 0],
			] as const
		)
			.filter(([, available]) => available)
			.map(([tab]) => tab),
		...extraTabs.map((extraTab) => extraTab.id),
	];

	const [selectedTab, setSelectedTab] = useState<string>();

	const tab =
		selectedTab && availableTabs.includes(selectedTab)
			? selectedTab
			: availableTabs[0];

	if (!tab) return null;

	return (
		<div className="flex flex-col gap-2">
			<Tabs
				value={tab}
				onValueChange={(value: string) => setSelectedTab(value)}
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
					{extraTabs.map((extraTab) => (
						<TabsTrigger key={extraTab.id} value={extraTab.id} className="px-0">
							{extraTab.label}
						</TabsTrigger>
					))}
				</TabsList>
				<TabsContent value="cast" className="p-0.75">
					<CastList people={cast.slice(0, MAX_PEOPLE)} />
				</TabsContent>
				<TabsContent value="crew" className="p-0.75">
					<CrewList people={crew.slice(0, MAX_PEOPLE)} />
				</TabsContent>
				<TabsContent value="genres" className="p-0.75">
					<MediaGenresBadge genres={genres} />
				</TabsContent>
				<TabsContent value="details" className="p-0.75">
					<MediaFactList facts={facts} />
				</TabsContent>
				{extraTabs.map((extraTab) => (
					<TabsContent key={extraTab.id} value={extraTab.id} className="p-0.75">
						{extraTab.content}
					</TabsContent>
				))}
			</Tabs>
			{hasMoreCredits(tab) ? (
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
