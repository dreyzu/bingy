import type { Pretty } from "shared";
import { apiFetch } from "./fetcher";

export type TvProgressStatus = "watching" | "on_hold" | "dropped";

export type TrackedShowStatus = TvProgressStatus | "completed";

export const TRACKED_SHOW_STATUSES: TrackedShowStatus[] = [
	"watching",
	"on_hold",
	"dropped",
	"completed",
];

export type TrackedShowFilter = "all" | TrackedShowStatus;

export const getTrackedShows = async (
	username: string,
	page = 1,
	language = "en-US",
	limit = 24,
	status: TrackedShowFilter = "all",
) => {
	const res = await apiFetch<GetTrackedShowsResponse>(
		`/progress/${username}/tv`,
		{
			method: "GET",
			query: { page, language, limit, status },
		},
	);
	return res;
};

export type MarkEpisodeWatchedPayload = {
	tmdbId: number;
	seasonNumber: number;
	episodeNumber: number;
	absoluteEpisode?: number | null;
	trackingMode?: "season" | "absolute";
	status?: TvProgressStatus;
	// ISO date the episode was watched, defaults to now
	watchedAt?: string;
};

export const markTvEpisodeWatched = async (
	payload: MarkEpisodeWatchedPayload,
) => {
	const res = await apiFetch<WatchProgress>(`/progress/tv`, {
		method: "POST",
		body: payload,
	});
	return res;
};

export const updateTvProgressStatus = async (
	tmdbId: number,
	status: TrackedShowStatus,
) => {
	const res = await apiFetch<WatchProgress>(`/progress/tv/${tmdbId}`, {
		method: "PATCH",
		body: { status },
	});
	return res;
};

// restarts a completed show from the first episode, incrementing its rewatch count
export const rewatchTvShow = async (tmdbId: number) => {
	const res = await apiFetch<WatchProgress>(`/progress/tv/${tmdbId}/rewatch`, {
		method: "POST",
	});
	return res;
};

// deletes the show progress entirely, removing it from the tracked shows list
export const removeTvProgress = async (tmdbId: number) => {
	const res = await apiFetch(`/progress/tv/${tmdbId}`, {
		method: "DELETE",
	});
	return res;
};

// returns null when the user has no progress for this show
export const getUserTvProgress = async (username: string, tmdbId: number) => {
	const res = await apiFetch<WatchProgress | null>(
		`/progress/${username}/tv/${tmdbId}`,
	);
	return res;
};

export type WatchProgress = Pretty<{
	id: string;
	lastWatchedSeason: number;
	lastWatchedEpisode: number;
	absoluteEpisode: number | null;
	lastWatchedAt: Date | null;
	trackingMode: "season" | "absolute";
	status: string;
	rewatchCount: number;
	createdAt: Date;
	updatedAt: Date;
}>;

export type NextEpisode = Pretty<{
	id: number;
	name: string;
	overview: string | null;
	air_date: string | null;
	episode_number: number;
	runtime: number | null;
	season_number: number;
	still_path: string | null;
}>;

export type TrackedShow = Pretty<{
	id: number;
	name: string;
	original_name: string;
	poster_path: string | null;
	status: string;
	tagline: string | null;
	last_episode_to_air: {
		id: number;
		season_number: number;
		episode_number: number;
	} | null;
	number_of_seasons: number;
	number_of_episodes: number;
	progress: WatchProgress;
	nextEpisodes: NextEpisode[];
}>;

export type GetTrackedShowsResponse = Pretty<{
	data: TrackedShow[];
	page: number;
	total_pages: number;
	total_results: number;
}>;
