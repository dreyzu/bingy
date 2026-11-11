import {
	IconDeviceTv,
	IconLayoutGrid,
	IconMovie,
	IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import type { Schemas } from "shared";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { m } from "@/paraglide/messages";
import { getRelevanceScore } from "@/utils/search-relevance-score";
import { SearchCard } from "./search-card";

interface SearchResultsContainerProps {
	results: Schemas.MediaMulti[];
	query: string;
}

type MediaType = "all" | "movie" | "tv" | "person";

export const SearchResultsContainer = ({
	results,
	query,
}: SearchResultsContainerProps) => {
	const [filter, setFilter] = useState<MediaType>("all");

	const filteredResults = (
		filter === "all"
			? results
			: results.filter((item) => item.media_type === filter)
	).sort((a, b) => getRelevanceScore(b, query) - getRelevanceScore(a, query));

	const handleFilterChange = (value: string) => {
		if (value) setFilter(value as MediaType);
	};

	return (
		<div className="flex flex-col gap-4 w-full">
			<h1>
				{m.vibrant_cream_wombat()}{" "}
				<span className="font-bold text-muted-foreground">"{query}"</span>
			</h1>
			<ToggleGroup
				value={filter ? [filter] : []}
				onValueChange={(values) => handleFilterChange(values[0] || "")}
				className="justify-start"
				spacing={2}
			>
				<ToggleGroupItem
					value="all"
					aria-label={m.wise_orange_cedar()}
					className="hover:cursor-pointer"
				>
					<IconLayoutGrid />
					{m.gallant_green_rocket()}
				</ToggleGroupItem>
				<ToggleGroupItem
					value="movie"
					aria-label={m.ample_sepia_tulip()}
					className="hover:cursor-pointer"
				>
					<IconMovie />
					{m.candid_lavender_harbor()}
				</ToggleGroupItem>
				<ToggleGroupItem
					value="tv"
					aria-label={m.fair_saffron_glacier()}
					className="hover:cursor-pointer"
				>
					<IconDeviceTv />
					{m.airy_yellow_rocket()}
				</ToggleGroupItem>
				<ToggleGroupItem
					value={m.frosty_wine_valley()}
					aria-label="People"
					className="hover:cursor-pointer"
				>
					<IconUsers />
					{m.gallant_violet_mesa()}
				</ToggleGroupItem>
			</ToggleGroup>

			<div className="flex flex-col gap-2">
				{filteredResults.map((item) => (
					<SearchCard key={`${item.media_type}-${item.id}`} item={item} />
				))}
			</div>

			{filteredResults.length === 0 ? (
				<div className="text-center text-muted-foreground py-8">
					{m.eager_silver_arrow()}
				</div>
			) : null}
		</div>
	);
};
