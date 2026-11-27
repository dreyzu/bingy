/** The frontend's locales (`apps/frontend/project.inlang/settings.json`). */
export const APP_LOCALES = [
	"en",
	"fr",
	"ko",
	"zh-CN",
	"zh-TW",
	"es-419",
	"es-ES",
	"it",
	"pt-BR",
	"pt-PT",
	"de",
	"ja",
] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

const TRADITIONAL_CHINESE_REGIONS = ["TW", "HK", "MO"];

export function isAppLocale(value: unknown): value is AppLocale {
	return APP_LOCALES.some((locale) => locale === value);
}

/**
 * Maps a language tag to the app locale it belongs to, with the same rules as
 * the frontend's locale detection (see AGENTS.md). The frontend sends regional
 * tags such as `fr-CA` or `es-MX` as TMDB's `language`, not the app locale.
 */
export function toAppLocale(tag: string | undefined): AppLocale | null {
	if (!tag) return null;
	const [language = "", ...rest] = tag.trim().toLowerCase().split(/[-_]/);
	const script = /^[a-z]{4}$/.test(rest[0] ?? "") ? rest[0] : undefined;
	const region = (script ? rest[1] : rest[0])?.toUpperCase();

	switch (language) {
		case "es":
			return region === "ES" ? "es-ES" : "es-419";
		case "pt":
			return region === "BR" ? "pt-BR" : "pt-PT";
		case "zh": {
			const isTraditional =
				script === "hant" ||
				(script !== "hans" &&
					region !== undefined &&
					TRADITIONAL_CHINESE_REGIONS.includes(region));
			return isTraditional ? "zh-TW" : "zh-CN";
		}
		default:
			return isAppLocale(language) ? language : null;
	}
}
