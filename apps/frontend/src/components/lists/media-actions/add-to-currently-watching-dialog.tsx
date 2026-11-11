import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { TvProgressStatus } from "@/api/in-progress";
import { SeasonEpisodeCombobox } from "@/components/lists/media-actions/season-episode-combobox";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAddTvToCurrentlyWatching } from "@/hooks/useInProgress";
import { useTv } from "@/hooks/useTv";
import { m } from "@/paraglide/messages";
import { getTvShowProgress } from "@/utils/season-helper";

const STATUS_OPTIONS: TvProgressStatus[] = ["watching", "on_hold", "dropped"];

const statusLabel = (status: TvProgressStatus) => {
	switch (status) {
		case "on_hold":
			return m.keen_cobalt_boulder();
		case "dropped":
			return m.epic_purple_raven();
		default:
			return m.lean_indigo_lynx();
	}
};

interface AddToCurrentlyWatchingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tvShow: {
		id: number;
		name: string;
	};
	username: string;
	existingProgress?: {
		lastWatchedSeason: number;
		lastWatchedEpisode: number;
		status: string;
	} | null;
}

export function AddToCurrentlyWatchingDialog({
	open,
	onOpenChange,
	tvShow,
	username,
	existingProgress,
}: AddToCurrentlyWatchingDialogProps) {
	const { data: tvDetails } = useTv(tvShow.id, {}, { enabled: open });

	const tvProgress = useMemo(() => getTvShowProgress(tvDetails), [tvDetails]);
	const validSeasons = tvProgress?.validSeasons ?? [];
	const lastAired = tvProgress?.lastAired ?? null;

	const [season, setSeason] = useState<number | null>(null);
	const [episode, setEpisode] = useState<number | null>(null);
	const [status, setStatus] = useState<TvProgressStatus>("watching");

	const addMutation = useAddTvToCurrentlyWatching(username);
	const isSubmitting = addMutation.isPending;

	// prefill with the current progress when updating an existing entry
	useEffect(() => {
		if (!open) return;
		setSeason(existingProgress?.lastWatchedSeason ?? null);
		setEpisode(existingProgress?.lastWatchedEpisode ?? null);
		setStatus(
			STATUS_OPTIONS.includes(existingProgress?.status as TvProgressStatus)
				? (existingProgress?.status as TvProgressStatus)
				: "watching",
		);
	}, [open, existingProgress]);

	const resetForm = () => {
		setSeason(null);
		setEpisode(null);
		setStatus("watching");
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) resetForm();
		onOpenChange(newOpen);
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (season === null || episode === null) return;

		addMutation.mutate(
			{
				tmdbId: tvShow.id,
				seasonNumber: season,
				episodeNumber: episode,
				trackingMode: "season",
				status,
			},
			{ onSuccess: () => handleOpenChange(false) },
		);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{m.dapper_mauve_island()}</DialogTitle>
					<DialogDescription>
						{m.bold_coral_daisy({ media_name: tvShow.name })}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<SeasonEpisodeCombobox
						lastAired={lastAired}
						seasons={validSeasons}
						selectedSeason={season}
						selectedEpisode={episode}
						onSeasonChange={(value) =>
							setSeason(value === null ? null : Number(value))
						}
						onEpisodeChange={(value) =>
							setEpisode(value === null ? null : Number(value))
						}
					/>

					<div className="flex flex-col gap-2">
						<Label>{m.fluffy_rust_saddle()}</Label>
						<div className="flex flex-wrap gap-2">
							{STATUS_OPTIONS.map((option) => (
								<Button
									key={option}
									type="button"
									size="sm"
									variant={status === option ? "default" : "outline"}
									aria-pressed={status === option}
									disabled={isSubmitting}
									onClick={() => setStatus(option)}
								>
									{statusLabel(option)}
								</Button>
							))}
						</div>
					</div>

					<div className="flex gap-2 self-end">
						<DialogClose
							render={
								<Button variant="outline" disabled={isSubmitting}>
									{m.upbeat_crimson_wombat()}
								</Button>
							}
						/>
						<Button
							type="submit"
							disabled={isSubmitting || season === null || episode === null}
						>
							{isSubmitting
								? m.bubbly_lavender_lantern()
								: m.winsome_mint_panda()}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
