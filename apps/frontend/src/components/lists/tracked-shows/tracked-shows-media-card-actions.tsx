import {
	IconArrowsExchange,
	IconCheck,
	IconDotsFilled,
	IconRepeat,
	IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import {
	type NextEpisode,
	TRACKED_SHOW_STATUSES,
	type TrackedShow,
	type TrackedShowStatus,
} from "@/api/tracked-shows";
import { getStatusLabel } from "@/components/lists/tracked-shows/tracked-shows-status";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	useMarkEpisodeWatched,
	useRemoveTvProgress,
	useRewatchTvShow,
	useUpdateTvProgressStatus,
} from "@/hooks/useTrackedShows";
import { useIsMobile } from "@/integrations/media-query";
import { m } from "@/paraglide/messages";

interface TrackedShowsMediaCardActionsProps {
	username: string;
	item: TrackedShow;
	// null when the next episode can't be marked as watched from the card
	nextEpisode: NextEpisode | null;
}

export const TrackedShowsMediaCardActions = ({
	username,
	item,
	nextEpisode,
}: TrackedShowsMediaCardActionsProps) => {
	const [open, setOpen] = useState(false);
	const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
	const isMobile = useIsMobile();
	const markWatched = useMarkEpisodeWatched(username);
	const updateStatus = useUpdateTvProgressStatus(username);
	const removeProgress = useRemoveTvProgress(username);
	const rewatch = useRewatchTvShow(username);

	const currentStatus = item.progress.status;
	const canRewatch = currentStatus === "completed";
	// a completed show goes back to watching through rewatch, which resets its progress
	const selectableStatuses = canRewatch
		? TRACKED_SHOW_STATUSES.filter((status) => status !== "watching")
		: TRACKED_SHOW_STATUSES;

	const handleMarkWatched = () => {
		if (!nextEpisode) return;
		markWatched.mutate({
			tmdbId: item.id,
			seasonNumber: nextEpisode.season_number,
			episodeNumber: nextEpisode.episode_number,
			trackingMode: item.progress.trackingMode,
		});
		setOpen(false);
	};

	const handleStatusChange = (status: TrackedShowStatus) => {
		setOpen(false);
		if (status === currentStatus) return;
		updateStatus.mutate({ tmdbId: item.id, status });
	};

	const handleRewatch = () => {
		rewatch.mutate(item.id);
		setOpen(false);
	};

	const handleRemoveClick = () => {
		setOpen(false);
		setConfirmRemoveOpen(true);
	};

	const handleConfirmRemove = () => {
		removeProgress.mutate(item.id);
		setConfirmRemoveOpen(false);
	};

	return (
		<div className="absolute right-2 top-2 z-10">
			{isMobile ? (
				<Drawer open={open} onOpenChange={setOpen} swipeDirection="up">
					<DrawerTrigger
						render={(props) => (
							<Button
								{...props}
								variant="ghost"
								size="icon"
								aria-label={m.dreamy_white_meerkat()}
								className="bg-background/70 backdrop-blur-sm hover:bg-background/90"
							>
								<IconDotsFilled />
							</Button>
						)}
					/>
					<DrawerContent>
						<DrawerBody>
							<div className="flex flex-col gap-4 p-4">
								{nextEpisode ? (
									<Button
										variant="ghost"
										className="w-full justify-start"
										disabled={markWatched.isPending}
										onClick={handleMarkWatched}
									>
										<IconCheck className="size-4" />
										{m.fair_cerise_wombat()}
									</Button>
								) : null}
								{canRewatch ? (
									<Button
										variant="ghost"
										className="w-full justify-start"
										disabled={rewatch.isPending}
										onClick={handleRewatch}
									>
										<IconRepeat className="size-4" />
										{m.epic_coral_valley()}
									</Button>
								) : null}

								<div className="flex flex-col gap-1">
									<span className="px-2.5 text-xs font-medium text-muted-foreground">
										{m.zippy_bronze_yak()}
									</span>
									{selectableStatuses.map((status) => (
										<Button
											key={status}
											variant={status === currentStatus ? "secondary" : "ghost"}
											className="w-full justify-start"
											aria-pressed={status === currentStatus}
											disabled={updateStatus.isPending}
											onClick={() => handleStatusChange(status)}
										>
											{getStatusLabel(status)}
											{status === currentStatus ? (
												<IconCheck className="ml-auto size-4" />
											) : null}
										</Button>
									))}
								</div>

								<Button
									variant="destructive"
									className="w-full justify-start"
									disabled={removeProgress.isPending}
									onClick={handleRemoveClick}
								>
									<IconTrash className="size-4" />
									{m.humble_khaki_blossom()}
								</Button>
							</div>
						</DrawerBody>
					</DrawerContent>
				</Drawer>
			) : (
				<DropdownMenu open={open} onOpenChange={setOpen}>
					<DropdownMenuTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								aria-label={m.dreamy_white_meerkat()}
								className="bg-background/70 backdrop-blur-sm hover:bg-background/90"
							>
								<IconDotsFilled />
							</Button>
						}
					/>
					<DropdownMenuContent align="end" className="min-w-72">
						{nextEpisode ? (
							<DropdownMenuItem
								disabled={markWatched.isPending}
								onClick={handleMarkWatched}
							>
								<IconCheck className="size-4" />
								{m.fair_cerise_wombat()}
							</DropdownMenuItem>
						) : null}
						{canRewatch ? (
							<DropdownMenuItem
								disabled={rewatch.isPending}
								onClick={handleRewatch}
							>
								<IconRepeat className="size-4" />
								{m.candid_cream_puma()}
							</DropdownMenuItem>
						) : null}
						<DropdownMenuSub>
							<DropdownMenuSubTrigger disabled={updateStatus.isPending}>
								<IconArrowsExchange className="size-4" />
								{m.wild_ivory_acorn()}
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuRadioGroup
									value={currentStatus}
									onValueChange={(value) =>
										handleStatusChange(value as TrackedShowStatus)
									}
								>
									{selectableStatuses.map((status) => (
										<DropdownMenuRadioItem
											key={status}
											value={status}
											closeOnClick
										>
											{getStatusLabel(status)}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							disabled={removeProgress.isPending}
							onClick={handleRemoveClick}
						>
							<IconTrash className="size-4" />
							{m.bold_jade_lemur()}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}

			<AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
				<AlertDialogContent>
					<AlertDialogTitle>
						{m.gleeful_rose_walrus({ name: item.name })}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{m.upbeat_silver_rabbit()}
					</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogCancel>{m.fancy_navy_zebra()}</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleConfirmRemove}
						>
							{m.fluffy_saffron_coral()}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
