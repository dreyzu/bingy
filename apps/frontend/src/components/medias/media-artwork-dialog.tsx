import { useAtomValue } from "jotai";
import { useId, useState } from "react";
import type { ArtworkKind, ArtworkScope, ArtworkTarget } from "@/api/artwork";
import { MediaArtworkPicker } from "@/components/medias/media-artwork-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { LoaderFive } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useArtworkImages, useArtworkOverrides } from "@/hooks/useArtwork";
import { localeAtom } from "@/lib/atoms/locale";
import { m } from "@/paraglide/messages";
import { LOCALE_LABELS } from "@/utils/locale-labels";

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
								<MediaArtworkPicker
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
