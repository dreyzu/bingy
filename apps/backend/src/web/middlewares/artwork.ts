import type { Context, Next } from "hono";
import { applyArtwork, mayHaveArtwork } from "../../lib/artwork/apply";
import { toAppLocale } from "../../lib/locales";
import { logger } from "../../lib/logger";

/**
 * Swaps TMDB posters and backdrops in JSON responses for the overrides the
 * viewer should see. It works on the outgoing response, after every cache, so
 * cached TMDB data stays shared and untouched: if `cacheMiddleware` is ever
 * mounted, mount it inside this one.
 */
export const artworkMiddleware = async (c: Context, next: Next) => {
	await next();

	if (c.req.method !== "GET" || !c.res.ok) return;
	if (!c.res.headers.get("content-type")?.includes("application/json")) return;

	try {
		const text = await c.res.clone().text();
		if (!mayHaveArtwork(text)) return;

		const body: unknown = JSON.parse(text);
		const viewer = c.get("user") as { id: string } | null;
		const changed = await applyArtwork(body, {
			viewerId: viewer?.id ?? null,
			locale: toAppLocale(c.req.query("language")),
		});
		if (!changed) return;

		const { status } = c.res;
		const headers = new Headers(c.res.headers);
		headers.delete("content-length");
		// Cleared first: assigning over a response merges the old one's headers.
		c.res = undefined;
		c.res = new Response(JSON.stringify(body), { status, headers });
	} catch (error) {
		// TMDB's images are better than a failed request.
		logger.error(error, "Failed to apply artwork overrides");
	}
};
