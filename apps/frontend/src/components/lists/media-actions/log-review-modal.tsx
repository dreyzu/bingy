import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AbsoluteEpisodeCombobox } from "@/components/lists/media-actions/absolute-episode-combobox";
import { ReviewTextarea } from "@/components/lists/media-actions/review-text-area";
import { SeasonEpisodeCombobox } from "@/components/lists/media-actions/season-episode-combobox";
import { StarRating } from "@/components/lists/media-actions/star-rating";
import { WatchedDateControl } from "@/components/lists/media-actions/watched-date-controls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerBody,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { useRateMovie, useRateTvShow } from "@/hooks/useRating";
import { useTv } from "@/hooks/useTv";
import { useIsMobile } from "@/integrations/media-query";
import { m } from "@/paraglide/messages";
import { getTvShowProgress } from "@/utils/season-helper";

interface LogReviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Called after the log or review is saved, once this has closed. */
	onSaved?: () => void;
	movie?: {
		mediaType?: string;
		id: number;
		title: string;
	};
	tvShow?: {
		mediaType?: string;
		id: number;
		name: string;
	};
	imageUrl: string | null;
	username: string;
	existingData?: {
		rating: number | null;
		review: string | null;
		watchedAt: Date | null;
		seasonNumber?: number | null;
		episodeNumber?: number | null;
		absoluteEpisode?: number | null;
	};
}

interface ReviewFormData {
	rating: number;
	season: number | null;
	episode: number | null;
	shouldUseAbsoluteEpisode: boolean;
	absoluteEpisode: number | null;
	isComplete: boolean;
	review: string;
	watchedDate: Date;
	hasSpecificDate: boolean;
}

const initialFormData = {
	season: null,
	episode: null,
	shouldUseAbsoluteEpisode: false,
	absoluteEpisode: null,
	isComplete: false,
	review: "",
	hasSpecificDate: true,
};

export function LogReviewModal({
	open,
	onOpenChange,
	onSaved,
	tvShow,
	movie,
	imageUrl,
	username,
	existingData,
}: LogReviewModalProps) {
	// Same `lg` breakpoint as the media actions, so both are drawers together.
	const isDesktop = !useIsMobile();
	const isTvShow = !!tvShow;
	const tmdbId = isTvShow ? tvShow.id : (movie?.id ?? 0);
	const rating = existingData?.rating ?? 0;

	const { data: tvDetails } = useTv(tmdbId, {}, { enabled: isTvShow });

	const tvProgress = useMemo(() => getTvShowProgress(tvDetails), [tvDetails]);

	const validSeasons = tvProgress?.validSeasons ?? [];
	const lastAired = tvProgress?.lastAired ?? null;
	const hasContinuousNumbering = lastAired?.isContinuous ?? false;
	const totalEpisodes = tvDetails?.number_of_episodes ?? 0;
	const mediaTitle = isTvShow ? tvShow.name : movie?.title;

	const rateMovieMutation = useRateMovie(username);
	const rateTvMutation = useRateTvShow(username);

	const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
		...initialFormData,
		rating,
		watchedDate: new Date(),
	});

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			setReviewFormData({
				...initialFormData,
				rating,
				watchedDate: new Date(),
			});
		}
		onOpenChange(newOpen);
	};

	useEffect(() => {
		if (!existingData || !open) return;

		const hasAbsoluteEpisode = existingData.absoluteEpisode !== null;

		setReviewFormData((prev) => ({
			...prev,
			rating,
			review: existingData.review ?? "",
			shouldUseAbsoluteEpisode: hasAbsoluteEpisode,
			absoluteEpisode: existingData.absoluteEpisode ?? null,
			season: hasAbsoluteEpisode ? null : (existingData.seasonNumber ?? null),
			episode: hasAbsoluteEpisode ? null : (existingData.episodeNumber ?? null),
			watchedDate: existingData.watchedAt
				? new Date(existingData.watchedAt)
				: new Date(),
			hasSpecificDate: !!existingData.watchedAt,
		}));
	}, [open, existingData, rating]);

	const handleHasSpecificDateChange = (checked: boolean) => {
		setReviewFormData((prev) => ({ ...prev, hasSpecificDate: checked }));
	};

	const handleCompleteChange = (checked: boolean | string) => {
		const isChecked = checked === true;
		if (!isChecked) {
			return setReviewFormData((prev) => ({
				...prev,
				isComplete: false,
				season: null,
				episode: null,
			}));
		}

		if (!lastAired) return;

		// Uses the normalized numbers (e.g., S22 E66 instead of E1155)
		setReviewFormData((prev) => ({
			...prev,
			isComplete: true,
			season: lastAired.seasonNumber,
			episode: lastAired.episodeNumber,
		}));
	};

	const handleShouldUseAbsoluteEpisodeChange = (checked: boolean) => {
		setReviewFormData((prev) => ({
			...prev,
			shouldUseAbsoluteEpisode: checked,
			season: null,
			episode: null,
			absoluteEpisode: null,
			isComplete: false,
		}));
	};

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		const payload = {
			tmdbId,
			rating: reviewFormData.rating || null,
			review: reviewFormData.review || null,
			watchedAt: reviewFormData.watchedDate || null,
		};

		const options = {
			onSuccess: () => {
				handleOpenChange(false);
				onSaved?.();
			},
		};

		if (!isTvShow) {
			return rateMovieMutation.mutate(payload, options);
		}

		rateTvMutation.mutate(
			{
				...payload,
				lastWatchedSeason: reviewFormData.season,
				lastWatchedEpisode: reviewFormData.episode,
				absoluteEpisode: reviewFormData.absoluteEpisode,
				trackingMode: reviewFormData.shouldUseAbsoluteEpisode
					? "absolute"
					: "season",
			},
			options,
		);
	};

	const isSubmitting = rateMovieMutation.isPending || rateTvMutation.isPending;

	const title = isTvShow ? m.spry_umber_pine() : m.steady_slate_canyon();
	const description = isTvShow
		? m.winsome_magenta_koala()
		: m.fancy_sepia_dolphin();

	const fields = (
		<>
			<div className="flex flex-col gap-2">
				<Label>{m.light_plum_hippo()}</Label>
				<StarRating
					username={username}
					rating={reviewFormData.rating}
					onRatingChange={(rating) =>
						setReviewFormData((prev) => ({ ...prev, rating }))
					}
					onRatingDelete={() =>
						setReviewFormData((prev) => ({ ...prev, rating: 0 }))
					}
				/>
			</div>

			<WatchedDateControl
				watchedDate={reviewFormData.watchedDate}
				hasSpecificDate={reviewFormData.hasSpecificDate}
				handleHasSpecificDateChange={handleHasSpecificDateChange}
				setWatchedDate={(watchedDate) =>
					setReviewFormData((prev) => ({ ...prev, watchedDate }))
				}
			/>

			{isTvShow ? (
				<div className="flex flex-col gap-4 border-t pt-4">
					<div className="flex items-center gap-2">
						<Checkbox
							id="isComplete"
							checked={reviewFormData.isComplete}
							onCheckedChange={handleCompleteChange}
						/>
						<Label htmlFor="isComplete" className="text-sm font-normal">
							{m.light_lemon_tiger()}
						</Label>
					</div>

					{!reviewFormData.isComplete && (
						<>
							{hasContinuousNumbering ? (
								<div className="flex items-center gap-2">
									<Checkbox
										id="useAbsoluteEpisode"
										checked={reviewFormData.shouldUseAbsoluteEpisode}
										onCheckedChange={handleShouldUseAbsoluteEpisodeChange}
									/>
									<Label
										htmlFor="useAbsoluteEpisode"
										className="text-sm font-normal"
									>
										{m.elegant_jade_parrot()}
									</Label>
								</div>
							) : null}

							{reviewFormData.shouldUseAbsoluteEpisode ? (
								<AbsoluteEpisodeCombobox
									totalEpisodes={totalEpisodes}
									selectedEpisode={reviewFormData.absoluteEpisode}
									onEpisodeChange={(absoluteEpisode) =>
										setReviewFormData((prev) => ({
											...prev,
											absoluteEpisode,
										}))
									}
								/>
							) : (
								<SeasonEpisodeCombobox
									lastAired={tvProgress?.lastAired}
									seasons={validSeasons}
									selectedSeason={reviewFormData.season}
									selectedEpisode={reviewFormData.episode}
									onSeasonChange={(season) =>
										setReviewFormData((prev) => ({ ...prev, season }))
									}
									onEpisodeChange={(episode) =>
										setReviewFormData((prev) => ({
											...prev,
											episode,
										}))
									}
								/>
							)}
						</>
					)}
				</div>
			) : null}

			<ReviewTextarea
				value={reviewFormData.review}
				onChange={(review) =>
					setReviewFormData((prev) => ({ ...prev, review }))
				}
				label={m.bright_sage_garden()}
				placeholder={m.balmy_mint_hippo()}
			/>
		</>
	);

	const cancelButton = (
		<Button variant="outline" disabled={isSubmitting}>
			{m.keen_coral_meerkat()}
		</Button>
	);

	const submitButton = (
		<Button type="submit" disabled={isSubmitting}>
			{isSubmitting ? m.fancy_mauve_galaxy() : m.gleeful_lemon_spruce()}
		</Button>
	);

	// Below `lg` this is a drawer. Rendered inside another drawer (the mobile
	// media actions), it stacks on top of it as a nested drawer.
	if (!isDesktop) {
		return (
			<Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="down">
				<DrawerContent className="max-h-[96vh]">
					<DrawerHeader className="justify-start items-start group-data-[swipe-direction=down]/drawer-content:text-left">
						<DrawerTitle>{title}</DrawerTitle>
						<DrawerDescription>{description}</DrawerDescription>
					</DrawerHeader>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col flex-1 min-h-0"
					>
						<DrawerBody>
							<div className="flex flex-col gap-4 px-4 pb-4">{fields}</div>
						</DrawerBody>
						<DrawerFooter className="flex-row justify-end pb-[calc(1rem+env(safe-area-inset-bottom))]">
							<DrawerClose render={cancelButton} />
							{submitButton}
						</DrawerFooter>
					</form>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="lg:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
				<div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden gap-8 p-6">
					{imageUrl ? (
						<div className="hidden lg:flex items-start justify-center shrink-0">
							<div className="w-full max-w-2xs sticky top-0">
								<img
									src={imageUrl}
									alt={mediaTitle || "Media poster"}
									className="w-full h-auto rounded-lg shadow-lg object-cover"
								/>
							</div>
						</div>
					) : null}

					<div className="flex flex-col flex-1 min-h-0 overflow-hidden">
						<DialogHeader className="shrink-0">
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription className="max-w-full lg:max-w-3/4">
								{description}
							</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={handleSubmit}
							className="flex flex-col flex-1 min-h-0 overflow-hidden"
						>
							<div className="flex flex-col gap-4 py-4 flex-1 overflow-y-auto min-h-0 pr-2">
								{fields}
							</div>

							<div className="sticky bottom-0 pt-4 shrink-0 flex gap-2 self-end">
								<DialogClose render={cancelButton} />
								{submitButton}
							</div>
						</form>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
