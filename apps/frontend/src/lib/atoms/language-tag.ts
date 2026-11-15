import type { Locale } from "@/paraglide/runtime";
import type { Region } from "./region";

type BaseLocale = Extract<Locale, "en" | "fr" | "ko" | "it">;

const VALID_COMBOS: Record<BaseLocale, readonly Region[]> = {
	en: ["US", "GB", "AU", "CA"],
	fr: ["FR", "CA"],
	ko: ["KR"],
	it: ["IT"],
};

const DEFAULT_FOR_LOCALE: Record<BaseLocale, Region> = {
	en: "US",
	fr: "FR",
	ko: "KR",
	it: "IT",
};

const REGIONAL_LANGUAGE_TAGS: Record<Exclude<Locale, BaseLocale>, string> = {
	"es-419": "es-MX",
	"es-ES": "es-ES",
	"pt-BR": "pt-BR",
	"pt-PT": "pt-PT",
	"zh-CN": "zh-CN",
	"zh-TW": "zh-TW",
	de: "de-DE",
	ja: "ja-JP",
};

function isBaseLocale(locale: Locale): locale is BaseLocale {
	return Object.hasOwn(VALID_COMBOS, locale);
}

export function getLanguageTag(locale: Locale, region: Region): string {
	if (!isBaseLocale(locale)) {
		return REGIONAL_LANGUAGE_TAGS[locale];
	}
	const validRegions = VALID_COMBOS[locale];
	const languageRegion = validRegions.includes(region)
		? region
		: DEFAULT_FOR_LOCALE[locale];
	return `${locale}-${languageRegion}`;
}
