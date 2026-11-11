import { createFileRoute } from "@tanstack/react-router";
import { PopularTv } from "@/components/tv/popular";
import { TopRatedTv } from "@/components/tv/top-rated";
import { TrendingTodayTv } from "@/components/tv/trending-today";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/tv/")({
	component: TvIndexPage,
});

function TvIndexPage() {
	return (
		<div className="flex flex-col w-full gap-4">
			<TopRatedTv title={m.hasty_silver_island()} />
			<TrendingTodayTv title={m.shiny_ruby_falcon()} />
			<PopularTv title={m.airy_scarlet_hippo()} />
		</div>
	);
}
