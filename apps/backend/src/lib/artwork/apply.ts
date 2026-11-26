import type { ArtworkKind } from "../../db/schemas";
import type { AppLocale } from "../locales";
import { resolveArtwork } from "./resolve";
import { type ArtworkMediaType, type ArtworkRef, artworkField } from "./store";

/** Image keys replaced on media items: TMDB's, and `getMediaDetails`'s. */
const IMAGE_KEYS: Record<string, ArtworkKind> = {
	poster_path: "poster",
	posterPath: "poster",
	backdrop_path: "backdrop",
};

const OWNER_KEY = "$artworkOwner";

/**
 * Added next to `backdrop_path` when the backdrop override has a crop
 * position: 0 (top) to 100 (bottom). Absent means the top.
 */
const BACKDROP_FOCUS_KEY = "backdrop_focus_y";

const MAY_HAVE_ARTWORK =
	/"(poster_path|posterPath|backdrop_path|\$artworkOwner)"/;

// Fields only TV shows have, to tell them apart from seasons, collections and
// lists, which also have a `name` and a poster.
const TV_FIELDS = ["first_air_date", "number_of_seasons", "origin_country"];

type JsonObject = Record<string, unknown>;

type Slot = {
	node: JsonObject;
	key: string;
	ref: ArtworkRef;
	ownerId: string | null;
};

/**
 * Shows the media inside `value` with `ownerId`'s artwork instead of the
 * viewer's. Wrap what a route returns with a review in it, so the review's
 * media follows its author. The marker is removed from the response.
 */
export function withArtworkOwner<T extends object>(
	value: T,
	ownerId: string,
): T {
	return { ...value, [OWNER_KEY]: ownerId };
}

/** Quick check on the raw body, to skip parsing responses without artwork. */
export function mayHaveArtwork(body: string): boolean {
	return MAY_HAVE_ARTWORK.test(body);
}

const isObject = (value: unknown): value is JsonObject =>
	typeof value === "object" && value !== null;

function mediaTypeOf(node: JsonObject): ArtworkMediaType | null {
	const explicit = node.media_type ?? node.mediaType;
	if (explicit !== undefined) {
		return explicit === "movie" || explicit === "tv" ? explicit : null;
	}
	if ("title" in node && ("release_date" in node || "original_title" in node)) {
		return "movie";
	}
	if ("name" in node && TV_FIELDS.some((field) => field in node)) {
		return "tv";
	}
	return null;
}

function collect(
	value: unknown,
	ownerId: string | null,
	state: { slots: Slot[]; hadMarker: boolean },
) {
	if (Array.isArray(value)) {
		for (const item of value) collect(item, ownerId, state);
		return;
	}
	if (!isObject(value)) return;

	let owner = ownerId;
	if (OWNER_KEY in value) {
		const marked = value[OWNER_KEY];
		if (typeof marked === "string") owner = marked;
		delete value[OWNER_KEY];
		state.hadMarker = true;
	}

	const tmdbId = value.id;
	const mediaType =
		typeof tmdbId === "number" && Number.isInteger(tmdbId)
			? mediaTypeOf(value)
			: null;
	if (mediaType && typeof tmdbId === "number") {
		for (const [key, kind] of Object.entries(IMAGE_KEYS)) {
			if (key in value) {
				state.slots.push({
					node: value,
					key,
					ref: { mediaType, tmdbId, kind },
					ownerId: owner,
				});
			}
		}
	}

	for (const child of Object.values(value)) {
		if (isObject(child)) collect(child, owner, state);
	}
}

/**
 * Replaces, in place, the posters and backdrops of the movies and TV shows in
 * a JSON body with their overrides. Returns whether the body changed.
 */
export async function applyArtwork(
	body: unknown,
	{ viewerId, locale }: { viewerId: string | null; locale: AppLocale | null },
): Promise<boolean> {
	const state = { slots: [] as Slot[], hadMarker: false };
	collect(body, viewerId, state);

	const slotsByOwner = Map.groupBy(state.slots, (slot) => slot.ownerId);
	let changed = state.hadMarker;

	await Promise.all(
		[...slotsByOwner].map(async ([ownerId, slots]) => {
			const resolved = await resolveArtwork(
				slots.map((slot) => slot.ref),
				{ ownerId, locale },
			);
			for (const slot of slots) {
				const override = resolved.get(artworkField(slot.ref));
				if (!override) continue;
				slot.node[slot.key] = override.filePath;
				if (slot.ref.kind === "backdrop" && override.focusY !== null) {
					slot.node[BACKDROP_FOCUS_KEY] = override.focusY;
				}
				changed = true;
			}
		}),
	);

	return changed;
}
