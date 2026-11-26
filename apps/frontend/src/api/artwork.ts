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
}: ArtworkSlot & { filePath: string }) => {
	const res = await apiFetch<{ data: ArtworkOverride }>(
		`/artwork/${mediaType}/${tmdbId}/${kind}/${scope}`,
		{ method: "PUT", body: { filePath } },
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
