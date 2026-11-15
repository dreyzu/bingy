import { isLocale, type Locale } from "@/paraglide/runtime";

const TRADITIONAL_CHINESE_REGIONS = ["TW", "HK", "MO"];

const SCRIPT_PATTERN = /^[a-z]{4}$/;
const REGION_PATTERN = /^([a-z]{2}|\d{3})$/;

export function matchLocale(tag: string): Locale | undefined {
	const [language = "", ...rest] = tag.trim().toLowerCase().split(/[-_]/);
	const script = SCRIPT_PATTERN.test(rest[0] ?? "") ? rest[0] : undefined;
	const regionSubtag = script ? rest[1] : rest[0];
	const region = REGION_PATTERN.test(regionSubtag ?? "")
		? (regionSubtag ?? "").toUpperCase()
		: undefined;

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
			return isLocale(language) ? language : undefined;
	}
}

export function matchLocaleFromList(
	tags: readonly string[],
): Locale | undefined {
	for (const tag of tags) {
		const locale = matchLocale(tag);
		if (locale) {
			return locale;
		}
	}
	return undefined;
}
