import { IconPhotoOff } from "@tabler/icons-react";
import { cn } from "cn";
import { useAtomValue } from "jotai";
import { useId, useState } from "react";
import type { Schemas } from "shared";
import type {
	ArtworkKind,
	ArtworkOverride,
	ArtworkScope,
	ArtworkSlot,
	ArtworkTarget,
} from "@/api/artwork";
import { MEDIA_BACKGROUND_MASK_CLASSES } from "@/components/medias/media-background-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { LoaderFive } from "@/components/ui/loader";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	useArtworkImages,
	useArtworkOverrides,
	useResetArtwork,
	useSetArtwork,
} from "@/hooks/useArtwork";
import { localeAtom } from "@/lib/atoms/locale";
import { m } from "@/paraglide/messages";
import { getLanguageName } from "@/utils/display-names";
import { LOCALE_LABELS } from "@/utils/locale-labels";
import { getTmdbImageUrl } from "@/utils/utils";

// Pixel counts of the usual video resolutions, highest first.
const QUALITY_TIERS = [
	{ pixels: 3840 * 2160, label: () => m.gallant_khaki_hippo() }, // 4K
	{ pixels: 2560 * 1440, label: () => m.zippy_navy_lemur() }, // 2K
	{ pixels: 1920 * 1080, label: () => m.sturdy_green_rocket() }, // HD
	{ pixels: 720 * 480, label: () => m.bright_hazel_panda() }, // SD
];

/**
 * Quality label of an image: the resolution its pixel count is nearest to, on
 * a log scale. Pixel counts rather than sizes, so posters get a label too.
 */
function qualityLabel(image: Schemas.Image): string | null {
	const pixels = image.width * image.height;
	if (!(pixels > 0)) return null;
	const distance = (tierPixels: number) =>
		Math.abs(Math.log(pixels / tierPixels));
	const nearest = QUALITY_TIERS.reduce((best, tier) =>
		distance(tier.pixels) < distance(best.pixels) ? tier : best,
	);
	return nearest.label();
}

/** Image language filter: every image, textless images, or an ISO 639-1 code. */
type LanguageFilter = "all" | "none" | (string & {});

interface MediaArtworkDialogProps extends ArtworkTarget {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Lets an admin replace a media's TMDB poster and backdrop, per locale. */
export function MediaArtworkDialog({
	open,
	onOpenChange,
	mediaType,
	tmdbId,
}: MediaArtworkDialogProps) {
	const locale = useAtomValue(localeAtom);
	const [kind, setKind] = useState<ArtworkKind>("poster");
	// The current locale is read on each render, as it can change while open.
	const [appliesToAll, setAppliesToAll] = useState(false);
	const scope: ArtworkScope = appliesToAll ? "all" : locale;
	const target = { mediaType, tmdbId };
	const scopeLabelId = useId();

	const images = useArtworkImages(target, open);
	const overrides = useArtworkOverrides(target, open);

	const handleScopeChange = (values: string[]) => {
		const value = values[0];
		if (value === "all" || value === locale) setAppliesToAll(value === "all");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90dvh] grid-rows-[auto_minmax(0,1fr)]">
				<DialogHeader>
					<DialogTitle>{m.loyal_periwinkle_squirrel()}</DialogTitle>
					<DialogDescription>{m.kind_slate_jaguar()}</DialogDescription>
				</DialogHeader>

				<Tabs
					value={kind}
					onValueChange={(value) => setKind(value as ArtworkKind)}
					className="min-h-0"
				>
					<TabsList>
						<TabsTrigger value="poster">{m.brisk_beige_flute()}</TabsTrigger>
						<TabsTrigger value="backdrop">
							{m.peppy_lavender_crystal()}
						</TabsTrigger>
					</TabsList>

					{(["poster", "backdrop"] as const).map((tabKind) => (
						<TabsContent
							key={tabKind}
							value={tabKind}
							className="flex min-h-0 flex-1 flex-col gap-3"
						>
							{/* Posters often carry the title, so they can differ per
							    locale. Backdrops apply to every locale. */}
							{tabKind === "poster" ? (
								<div className="flex flex-wrap items-center gap-2">
									<Label id={scopeLabelId}>{m.humble_coral_fern()}</Label>
									<ToggleGroup
										aria-labelledby={scopeLabelId}
										value={[scope]}
										onValueChange={handleScopeChange}
										variant="outline"
										size="sm"
										spacing={2}
									>
										<ToggleGroupItem value={locale}>
											{m.agile_rose_beaver({ language: LOCALE_LABELS[locale] })}
										</ToggleGroupItem>
										<ToggleGroupItem value="all">
											{m.alert_magenta_rabbit()}
										</ToggleGroupItem>
									</ToggleGroup>
								</div>
							) : null}

							{images.isLoading || overrides.isLoading ? (
								<div className="flex justify-center py-8">
									<LoaderFive text={m.velvet_onyx_garden()} />
								</div>
							) : images.isError || overrides.isError ? (
								<p className="py-8 text-center text-muted-foreground">
									{m.velvet_violet_cloud()}
								</p>
							) : (
								<ArtworkPicker
									target={target}
									kind={tabKind}
									scope={tabKind === "poster" ? scope : "all"}
									images={
										(tabKind === "poster"
											? images.data?.posters
											: images.data?.backdrops) ?? []
									}
									overrides={overrides.data ?? []}
								/>
							)}
						</TabsContent>
					))}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

interface ArtworkPickerProps {
	target: ArtworkTarget;
	kind: ArtworkKind;
	scope: ArtworkScope;
	images: Schemas.Image[];
	overrides: ArtworkOverride[];
}

function ArtworkPicker({
	target,
	kind,
	scope,
	images,
	overrides,
}: ArtworkPickerProps) {
	const locale = useAtomValue(localeAtom);
	const setArtwork = useSetArtwork();
	const resetArtwork = useResetArtwork();
	const isPending = setArtwork.isPending || resetArtwork.isPending;

	const languages = [
		...new Set(images.flatMap((image) => image.iso_639_1 ?? [])),
	].sort((a, b) =>
		(getLanguageName(a, locale) ?? a).localeCompare(
			getLanguageName(b, locale) ?? b,
			locale,
		),
	);
	const hasTextless = images.some((image) => !image.iso_639_1);
	const localeLanguage = locale.split("-")[0] ?? "";

	// Start with the likely pick: posters in the app's language, and backdrops
	// without text, since they show in every locale.
	const [filter, setFilter] = useState<LanguageFilter>(() => {
		if (kind === "backdrop") return hasTextless ? "none" : "all";
		return languages.includes(localeLanguage) ? localeLanguage : "all";
	});

	const filterLabel = (value: LanguageFilter) => {
		if (value === "all") return m.airy_onyx_cricket();
		if (value === "none") return m.vibrant_purple_mirror();
		return getLanguageName(value, locale) ?? value;
	};

	const visibleImages = images.filter((image) => {
		if (filter === "all") return true;
		if (filter === "none") return !image.iso_639_1;
		return image.iso_639_1 === filter;
	});

	const ofKind = overrides.filter((override) => override.kind === kind);
	const current = ofKind.find(
		(override) => (override.locale ?? "all") === scope,
	);
	// With no pick for the locale, the one for every locale is what shows.
	const inherited =
		scope !== "all" && !current
			? ofKind.find((override) => override.locale === null)
			: undefined;

	const slot = { ...target, kind, scope };

	const pick = (filePath: string) => {
		if (filePath === current?.filePath) return;
		setArtwork.mutate({ ...slot, filePath });
	};

	if (images.length === 0) {
		return (
			<Empty className="min-h-50">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<IconPhotoOff className="size-4" />
					</EmptyMedia>
					<EmptyTitle>{m.brave_khaki_otter()}</EmptyTitle>
					<EmptyDescription>{m.elegant_yellow_rocket()}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Select
					value={filter}
					onValueChange={(value) => setFilter(value ?? "all")}
				>
					<SelectTrigger
						aria-label={m.fancy_mint_kettle()}
						className="min-w-40"
					>
						<SelectValue>{filterLabel(filter)}</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{filterLabel("all")}</SelectItem>
						{hasTextless ? (
							<SelectItem value="none">{filterLabel("none")}</SelectItem>
						) : null}
						{languages.map((language) => (
							<SelectItem key={language} value={language}>
								{filterLabel(language)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					variant="outline"
					size="sm"
					disabled={!current || isPending}
					onClick={() => resetArtwork.mutate(slot)}
				>
					{m.sunny_pink_eagle()}
				</Button>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
				{kind === "backdrop" && current ? (
					<BackdropPosition
						// Starts over from the saved position after each save or pick.
						key={`${current.filePath}:${current.focusY}`}
						slot={slot}
						override={current}
					/>
				) : null}
				<div
					className={cn(
						"grid gap-2 p-1",
						kind === "poster"
							? "grid-cols-3 sm:grid-cols-4"
							: "grid-cols-1 sm:grid-cols-2",
					)}
				>
					{visibleImages.map((image) => {
						const filePath = image.file_path;
						if (!filePath) return null;
						const isCurrent = filePath === current?.filePath;
						const isInherited = filePath === inherited?.filePath;
						const quality = qualityLabel(image);

						return (
							<button
								key={filePath}
								type="button"
								aria-label={
									kind === "poster"
										? m.noble_onyx_otter()
										: m.zesty_teal_turtle()
								}
								aria-pressed={isCurrent}
								disabled={isPending}
								onClick={() => pick(filePath)}
								className={cn(
									"relative overflow-hidden rounded-lg border-2 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait",
									kind === "poster" ? "aspect-2/3" : "aspect-video",
									isCurrent
										? "border-primary"
										: "border-transparent opacity-80 hover:opacity-100",
								)}
							>
								<img
									src={
										getTmdbImageUrl(
											filePath,
											kind === "poster" ? "w200" : "w500",
										) ?? undefined
									}
									alt=""
									className="size-full object-cover"
									loading="lazy"
								/>
								{isCurrent ? (
									<Badge className="absolute top-1 left-1">
										{m.glossy_azure_maple()}
									</Badge>
								) : isInherited ? (
									<Badge variant="secondary" className="absolute top-1 left-1">
										{m.alert_yellow_beacon()}
									</Badge>
								) : null}
								{quality ? (
									<Badge
										variant="secondary"
										className="absolute right-1 bottom-1 px-1.5 text-[10px]"
									>
										{quality}
									</Badge>
								) : null}
							</button>
						);
					})}
				</div>
			</div>
		</>
	);
}

interface BackdropPositionProps {
	slot: ArtworkSlot;
	override: ArtworkOverride;
}

/**
 * Picks which part of the backdrop shows where the page is shorter than the
 * image, with a preview of the widest screen, where the most is cropped.
 */
function BackdropPosition({ slot, override }: BackdropPositionProps) {
	const savedFocusY = override.focusY ?? 0;
	const [focusY, setFocusY] = useState(savedFocusY);
	const setArtwork = useSetArtwork();
	const labelId = useId();

	return (
		<div className="mb-3 flex flex-col gap-2 p-1">
			<Label id={labelId}>{m.cozy_topaz_lemur()}</Label>
			{/* The page backdrop at its widest: 80rem by 28.125rem. */}
			<div className="aspect-[128/45] w-full overflow-hidden rounded-lg">
				<div className={cn("size-full", MEDIA_BACKGROUND_MASK_CLASSES)}>
					<img
						src={getTmdbImageUrl(override.filePath, "w500") ?? undefined}
						alt=""
						className="block size-full object-cover"
						style={{ objectPosition: `50% ${focusY}%` }}
					/>
				</div>
			</div>
			<p className="text-xs text-muted-foreground">{m.dapper_rose_arrow()}</p>
			<div className="flex items-center gap-3">
				<Slider
					aria-labelledby={labelId}
					min={0}
					max={100}
					step={1}
					value={focusY}
					onValueChange={(value) => setFocusY(value as number)}
					disabled={setArtwork.isPending}
					className="flex-1"
				/>
				<Button
					size="sm"
					disabled={focusY === savedFocusY || setArtwork.isPending}
					onClick={() =>
						setArtwork.mutate({ ...slot, filePath: override.filePath, focusY })
					}
				>
					{m.vivid_ruby_iguana()}
				</Button>
			</div>
		</div>
	);
}
