type DisplayNameType = "language" | "region";

/** TMDB codes that are not valid ISO 639 codes, mapped to the real ones. */
const TMDB_LANGUAGE_CODES: Record<string, string> = {
	cn: "yue", // TMDB uses "cn" for Cantonese
};

/** TMDB code for media without spoken language. */
const NO_LANGUAGE_CODE = "xx";

const displayNamesCache = new Map<string, Intl.DisplayNames | null>();

function getDisplayNames(locale: string, type: DisplayNameType) {
	const cacheKey = `${locale}:${type}`;
	const cached = displayNamesCache.get(cacheKey);
	if (cached !== undefined) return cached;

	let displayNames: Intl.DisplayNames | null;
	try {
		displayNames = new Intl.DisplayNames([locale], { type, fallback: "none" });
	} catch {
		displayNames = null;
	}
	displayNamesCache.set(cacheKey, displayNames);
	return displayNames;
}

function getDisplayName(code: string, locale: string, type: DisplayNameType) {
	try {
		return getDisplayNames(locale, type)?.of(code);
	} catch {
		// `of` throws on malformed codes
		return undefined;
	}
}

/**
 * Localized name of a TMDB language code (ISO 639-1), e.g. "en" → "English".
 * Returns undefined for unknown codes and for TMDB's "no language" code.
 */
export function getLanguageName(code: string, locale: string) {
	if (!code || code === NO_LANGUAGE_CODE) return undefined;
	return getDisplayName(TMDB_LANGUAGE_CODES[code] ?? code, locale, "language");
}

/**
 * Spoken languages of a media as a localized list, e.g. "English and French".
 * Returns undefined when no language has a name.
 */
export function formatSpokenLanguages(
	languages: Array<{ iso_639_1: string; english_name: string }>,
	locale: string,
) {
	const names = languages.flatMap((language) => {
		if (language.iso_639_1 === NO_LANGUAGE_CODE) return [];
		const name =
			getLanguageName(language.iso_639_1, locale) ?? language.english_name;
		return name ? [name] : [];
	});
	if (names.length === 0) return undefined;

	try {
		return new Intl.ListFormat(locale, { type: "conjunction" }).format(names);
	} catch {
		return new Intl.ListFormat(undefined, { type: "conjunction" }).format(
			names,
		);
	}
}

/** Localized name of a country code (ISO 3166-1), e.g. "US" → "United States". */
export function getRegionName(code: string, locale: string) {
	if (!code) return undefined;
	return getDisplayName(code.toUpperCase(), locale, "region");
}
