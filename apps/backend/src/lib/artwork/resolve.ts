import type { AppLocale } from "../locales";
import {
	type ArtworkOverride,
	type ArtworkRef,
	type ArtworkScope,
	artworkField,
	getScopeOverrides,
} from "./store";

/**
 * Whether `userId` can pick their own artwork. No one can until premium
 * exists: this is where its role check goes.
 */
async function canPickOwnArtwork(_userId: string): Promise<boolean> {
	return false;
}

/**
 * Scopes to look in for media shown as `ownerId` sees it, in `locale`. The
 * first scope with an override wins, and TMDB's image is used when none has one.
 */
export async function scopesFor(
	ownerId: string | null,
	locale: AppLocale | null,
): Promise<ArtworkScope[]> {
	const scopes: ArtworkScope[] = [];

	if (ownerId && (await canPickOwnArtwork(ownerId))) {
		if (locale) scopes.push({ userId: ownerId, locale });
		scopes.push({ userId: ownerId, locale: null });
	}

	if (locale) scopes.push({ userId: null, locale });
	scopes.push({ userId: null, locale: null });

	return scopes;
}

/**
 * The override of each ref that has one, keyed by `artworkField`,
 * as `ownerId` sees it. `ownerId` is the viewer, except for media shown with a
 * review, which follows the review's author.
 */
export async function resolveArtwork(
	refs: ArtworkRef[],
	{ ownerId, locale }: { ownerId: string | null; locale: AppLocale | null },
): Promise<Map<string, ArtworkOverride>> {
	const resolved = new Map<string, ArtworkOverride>();
	const fields = [...new Set(refs.map(artworkField))];
	if (fields.length === 0) return resolved;

	const scopes = await scopesFor(ownerId, locale);
	const valuesByScope = await Promise.all(
		scopes.map((scope) => getScopeOverrides(scope, fields)),
	);

	// Scopes are in priority order: keep the first match of each field.
	for (const values of valuesByScope) {
		values.forEach((override, index) => {
			const field = fields[index];
			if (override && field && !resolved.has(field)) {
				resolved.set(field, override);
			}
		});
	}

	return resolved;
}
