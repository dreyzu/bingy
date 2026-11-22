import type { Region } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import type { Locale } from "@/paraglide/runtime";

/** Each locale written in its own language, so people can find theirs. */
export const LOCALE_LABELS: Record<Locale, string> = {
	en: "English",
	fr: "Français",
	ko: "한국어",
	"zh-CN": "简体中文",
	"zh-TW": "繁體中文",
	"es-419": "Español (Latinoamérica)",
	"es-ES": "Español (España)",
	it: "Italiano",
	"pt-BR": "Português (Brasil)",
	"pt-PT": "Português (Portugal)",
	de: "Deutsch",
	ja: "日本語",
};

export const getRegionName = (region: Region): string => {
	switch (region) {
		case "FR":
			return m.vibrant_onyx_dolphin();
		case "CA":
			return m.sunny_mauve_basil();
		case "US":
			return m.bright_gray_cricket();
		case "GB":
			return m.tidy_copper_rabbit();
		case "AU":
			return m.jaunty_wine_eagle();
		case "KR":
			return m.witty_periwinkle_canyon();
		case "IT":
			return m.zippy_sage_nectar();
		case "MX":
			return m.swift_slate_mesa();
		case "ES":
			return m.vibrant_teal_planet();
		case "BR":
			return m.dusky_lemon_beaver();
		case "PT":
			return m.daring_bronze_blossom();
		case "TW":
			return m.modest_onyx_yak();
		case "JP":
			return m.silent_maroon_oasis();
		case "DE":
			return m.dreamy_ruby_banjo();
		default:
			return region;
	}
};
