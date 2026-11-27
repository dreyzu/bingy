import type { Schemas } from "shared";
import type { Locale } from "@/paraglide/runtime";
import { apiFetch } from "./fetcher";

export type ArtworkMediaType = "movie" | "tv";

export type ArtworkKind = "poster" | "backdrop";

/** An app locale, or every locale. */
export type ArtworkScope = Locale | "all";

export type ArtworkOverride = {
	kind: ArtworkKind;
	/** Null when it applies to every locale. */
	locale: Locale | null;
	filePath: string;
	/** Backdrops only: vertical crop position, 0 (top) to 100 (bottom). */
	focusY: number | null;
};

/**
 * Crop position the backend adds to a media (`backdrop_focus_y`) when its
 * backdrop override has one. Null means the top.
 */
export const getBackdropFocusY = (media: object | undefined): number | null => {
	const value =
		media && "backdrop_focus_y" in media ? media.backdrop_focus_y : undefined;
	return typeof value === "number" ? value : null;
};

export type ArtworkImages = {
	posters: Schemas.Image[];
	backdrops: Schemas.Image[];
};

export type ArtworkTarget = {
	mediaType: ArtworkMediaType;
	tmdbId: number;
};

export type ArtworkSlot = ArtworkTarget & {
	kind: ArtworkKind;
	scope: ArtworkScope;
};

export const fetchArtworkImages = async ({
	mediaType,
	tmdbId,
}: ArtworkTarget) => {
	const res = await apiFetch<{ data: ArtworkImages }>(
		`/artwork/${mediaType}/${tmdbId}/images`,
	);
	return res.data;
};

export const fetchArtworkOverrides = async ({
	mediaType,
	tmdbId,
}: ArtworkTarget) => {
	const res = await apiFetch<{ data: { overrides: ArtworkOverride[] } }>(
		`/artwork/${mediaType}/${tmdbId}`,
	);
	return res.data.overrides;
};

export const setArtwork = async ({
	mediaType,
	tmdbId,
	kind,
	scope,
	filePath,
	focusY,
}: ArtworkSlot & { filePath: string; focusY?: number }) => {
	const res = await apiFetch<{ data: ArtworkOverride }>(
		`/artwork/${mediaType}/${tmdbId}/${kind}/${scope}`,
		{ method: "PUT", body: { filePath, focusY } },
	);
	return res.data;
};

export const resetArtwork = async ({
	mediaType,
	tmdbId,
	kind,
	scope,
}: ArtworkSlot) => {
	await apiFetch(`/artwork/${mediaType}/${tmdbId}/${kind}/${scope}`, {
		method: "DELETE",
	});
};
