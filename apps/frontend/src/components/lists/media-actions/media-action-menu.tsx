import { IconDots, IconPlayerPlay } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import {
	useMovieRating,
	useRateMovie,
	useRateTvShow,
	useTvRating,
} from "@/hooks/useRating";
import { useSession } from "@/hooks/useSession";
import { useUserTvProgress } from "@/hooks/useTrackedShows";
import { useTv } from "@/hooks/useTv";
import { useMediaQuery } from "@/integrations/media-query";
import { m } from "@/paraglide/messages";
import { getTvShowProgress } from "@/utils/season-helper";
import { getTmdbImageUrl } from "@/utils/utils";
import { WatchlistToggleButton } from "../watchlist/watchlist-toggle-button";
import { AddToListButton } from "./action-bar/add-to-list-button";
import { LogReviewButton } from "./action-bar/log-review-button";
import { ShareButton } from "./action-bar/share-button";
import { AddToListDialog } from "./add-to-list-dialog";
import { AddToTrackedShowsDialog } from "./add-to-tracked-shows-dialog";
import { FavoriteToggleButton } from "./favorite-toggle-button";
import { LogReviewModal } from "./log-review-modal";
import { StarRating } from "./star-rating";
import { WatchToggleButton } from "./watch-toggle-button";

interface MediaActionMenuProps {
	movie?: {
		mediaType?: string;
		id: number;
		title: string;
		posterPath: string | null;
		releaseDate: string;
	};
	tvShow?: {
		mediaType?: string;
		id: number;
		name: string;
		posterPath: string | null;
		releaseDate: string;
	};
	username: string;
	posterPath: string | null;
}

export const MediaActionMenu = ({
	movie,
	tvShow,
	username,
	posterPath,
}: MediaActionMenuProps) => {
	const passProps = { movie, tvShow, username };
	const imageUrl = getTmdbImageUrl(posterPath, "w500");

	const isTvShow = !!tvShow;
	const tmdbId = isTvShow ? tvShow.id : (movie?.id ?? 0);

	const { data: tvDetails } = useTv(tmdbId, {}, { enabled: isTvShow });

	const tvProgress = useMemo(() => getTvShowProgress(tvDetails), [tvDetails]);

	const { data: userTvProgress } = useUserTvProgress(
		username,
		tmdbId,
		isTvShow,
	);

	const { data: movieRating } = useMovieRating(username, tmdbId);
	const { data: tvRating } = useTvRating(username, tmdbId);

	const rateMovieMutation = useRateMovie(username);
	const rateTvMutation = useRateTvShow(username);

	const handleRatingChange = (newRating: number) => {
		if (!isTvShow) {
			return rateMovieMutation.mutate({
				tmdbId,
				rating: newRating,
				review: null,
				watchedAt: new Date(),
			});
		}

		if (!tvProgress?.lastAired) return;

		rateTvMutation.mutate({
			tmdbId,
			rating: newRating,
			review: null,
			lastWatchedSeason: tvProgress.lastAired.seasonNumber,
			lastWatchedEpisode: tvProgress.lastAired.episodeNumber,
			absoluteEpisode: null,
			trackingMode: "season",
			watchedAt: new Date(),
		});
	};

	const session = useSession();
	// Matches the `lg` breakpoint where the details layout moves the actions
	// beside the header.
	const isDesktop = useMediaQuery("(min-width: 64rem)");
	const [menuOpen, setMenuOpen] = useState(false);

	const [showAddToListDialog, setShowAddToListDialog] = useState(false);
	const [showLogReviewModal, setShowLogReviewModal] = useState(false);
	const [showAddToTrackedShowsDialog, setShowAddToTrackedShowsDialog] =
		useState(false);

	const existingRating = isTvShow ? tvRating : movieRating;

	const title = movie?.title ?? tvShow?.name ?? "";
	const year = movie?.releaseDate
		? new Date(movie.releaseDate).getFullYear()
		: tvShow?.releaseDate
			? new Date(tvShow.releaseDate).getFullYear()
			: "N/A";

	// Dialogs open on top of the page, so the mobile drawer closes first.
	const openDialog = (open: (value: boolean) => void) => {
		setMenuOpen(false);
		open(true);
	};

	const quickActions = (
		<>
			<div className="flex w-full flex-row justify-around items-center gap-4">
				<WatchToggleButton {...passProps} />
				<FavoriteToggleButton {...passProps} />
				<WatchlistToggleButton {...passProps} />
			</div>
			<Separator />
			<div className="flex w-full justify-center">
				<StarRating
					movie={movie}
					tvShow={tvShow}
					fetchRating={true}
					onRatingChange={handleRatingChange}
					username={username}
					gapSize={2}
					iconSize={8}
				/>
			</div>
		</>
	);

	// On mobile this opens as a drawer nested in the actions drawer, so the
	// actions drawer stays open behind it until the log or review is saved.
	const logReviewModal = (
		<LogReviewModal
			username={username}
			open={showLogReviewModal}
			onOpenChange={setShowLogReviewModal}
			onSaved={() => setMenuOpen(false)}
			movie={movie}
			tvShow={tvShow}
			imageUrl={imageUrl}
			existingData={existingRating}
		/>
	);

	const actionButtons = (
		<>
			<LogReviewButton
				existingRating={!!existingRating}
				onClick={() => setShowLogReviewModal(true)}
			/>
			{tvShow ? (
				<Button
					variant="ghost"
					onClick={() => openDialog(setShowAddToTrackedShowsDialog)}
					className="flex gap-2"
				>
					<span>
						{userTvProgress
							? m.humble_turquoise_moose()
							: m.lush_pink_blossom()}
					</span>
					<IconPlayerPlay className="ml-auto" />
				</Button>
			) : null}
			<AddToListButton onClick={() => openDialog(setShowAddToListDialog)} />
			<ShareButton
				text={m.silent_ochre_pine({
					media_name: title,
					year: year,
				})}
			/>
		</>
	);

	const displayName = session?.user.displayName ?? username;

	return (
		<>
			{isDesktop ? (
				<Card className="min-w-3xs">
					<CardHeader className="flex flex-col w-full gap-4">
						{quickActions}
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						{actionButtons}
					</CardContent>
				</Card>
			) : (
				<Drawer
					open={menuOpen}
					onOpenChange={setMenuOpen}
					swipeDirection="down"
				>
					{/* `dark` keeps the trigger dark in light mode too. */}
					<DrawerTrigger
						render={
							<Item
								variant="outline"
								size="sm"
								render={<button type="button" />}
								className="dark px-4 bg-card text-left text-card-foreground cursor-pointer hover:bg-muted data-popup-open:bg-muted"
							/>
						}
					>
						<ItemMedia>
							<Avatar className="size-7">
								<AvatarImage
									src={session?.user.image ?? ""}
									alt={displayName}
								/>
								<AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
							</Avatar>
						</ItemMedia>
						<ItemContent className="min-w-0">
							<ItemTitle className="block w-full truncate font-normal">
								{m.daring_lilac_harbor()}
							</ItemTitle>
						</ItemContent>
						<ItemActions>
							<IconDots className="size-5 text-muted-foreground" />
						</ItemActions>
					</DrawerTrigger>
					<DrawerContent>
						<DrawerTitle className="sr-only">{title}</DrawerTitle>
						<DrawerBody>
							<div className="flex flex-col gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
								{quickActions}
								<div className="flex flex-col gap-2">{actionButtons}</div>
							</div>
						</DrawerBody>
						{logReviewModal}
					</DrawerContent>
				</Drawer>
			)}

			{isDesktop ? logReviewModal : null}
			{tvShow ? (
				<AddToTrackedShowsDialog
					open={showAddToTrackedShowsDialog}
					onOpenChange={setShowAddToTrackedShowsDialog}
					tvShow={tvShow}
					username={username}
					existingProgress={userTvProgress ?? null}
				/>
			) : null}
			<AddToListDialog
				open={showAddToListDialog}
				onOpenChange={setShowAddToListDialog}
				movie={movie}
				tvShow={tvShow}
				username={username}
			/>
		</>
	);
};
