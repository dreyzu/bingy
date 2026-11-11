import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { getLanguageTag } from "./language-tag";
import { localeAtom } from "./locale";

const SUPPORTED_REGIONS = [
	"CA",
	"US",
	"FR",
	"GB",
	"AU",
	"KR",
	"MX",
	"IT",
	"ES",
	"BR",
	"PT",
	"TW",
] as const;
type Region = (typeof SUPPORTED_REGIONS)[number];

const DEFAULT_REGION: Region = "US";

function isSupportedRegion(value: unknown): value is Region {
	return SUPPORTED_REGIONS.some((region) => region === value);
}

function getStoredRegion(): Region | undefined {
	const stored = localStorage.getItem("region");
	if (!stored) {
		return undefined;
	}

	try {
		const value: unknown = JSON.parse(stored);
		return isSupportedRegion(value) ? value : undefined;
	} catch {
		return undefined;
	}
}

const getInitialRegion = (): Region => {
	const stored = getStoredRegion();
	if (stored) {
		return stored;
	}

	// Auto-detect and save
	const detected = getUserRegionFromNavigator() ?? DEFAULT_REGION;
	localStorage.setItem("region", JSON.stringify(detected));
	return detected;
};

const BRAZIL_TIMEZONES = [
	"America/Araguaina",
	"America/Bahia",
	"America/Belem",
	"America/Boa_Vista",
	"America/Campo_Grande",
	"America/Cuiaba",
	"America/Eirunepe",
	"America/Fortaleza",
	"America/Maceio",
	"America/Manaus",
	"America/Noronha",
	"America/Porto_Velho",
	"America/Recife",
	"America/Rio_Branco",
	"America/Santarem",
	"America/Sao_Paulo",
	"Brazil/East",
];

const MEXICO_TIMEZONES = [
	"America/Bahia_Banderas",
	"America/Cancun",
	"America/Chihuahua",
	"America/Ciudad_Juarez",
	"America/Ensenada",
	"America/Hermosillo",
	"America/Matamoros",
	"America/Mazatlan",
	"America/Merida",
	"America/Mexico_City",
	"America/Monterrey",
	"America/Ojinaga",
	"America/Santa_Isabel",
	"America/Tijuana",
	"Mexico/General",
];

export function getRegionFromTimezone(timezone: string): Region | undefined {
	if (BRAZIL_TIMEZONES.includes(timezone)) return "BR";
	if (MEXICO_TIMEZONES.includes(timezone)) return "MX";

	if (timezone.startsWith("America/")) {
		if (
			timezone.includes("Toronto") ||
			timezone.includes("Vancouver") ||
			timezone.includes("Montreal")
		) {
			return "CA";
		}
		return "US";
	}
	if (timezone.startsWith("Europe/Paris")) return "FR";
	if (timezone.startsWith("Europe/London")) return "GB";
	if (timezone.startsWith("Europe/Rome")) return "IT";
	if (timezone.startsWith("Europe/Madrid")) return "ES";
	if (timezone.startsWith("Europe/Lisbon")) return "PT";
	if (timezone.startsWith("Australia/")) return "AU";
	if (timezone.startsWith("Asia/Seoul")) return "KR";
	if (timezone.startsWith("Asia/Taipei")) return "TW";

	return undefined;
}

function getUserRegionFromNavigator(): Region | undefined {
	if (typeof Intl === "undefined" || typeof navigator === "undefined") {
		return undefined;
	}

	try {
		// Try timezone first
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const regionFromTimezone = getRegionFromTimezone(timezone);
		if (regionFromTimezone) {
			return regionFromTimezone;
		}

		// Fallback to navigator.language
		const locale = navigator.language.split("-")[1]?.toUpperCase();
		return isSupportedRegion(locale) ? locale : undefined;
	} catch {
		return undefined;
	}
}

const regionStorage = atomWithStorage<Region>("region", getInitialRegion());

// Used only for api calls with a region param
export const regionAtom = atom(
	(get) => get(regionStorage),
	(_get, set, newRegion: Region) => {
		set(regionStorage, newRegion);
	},
);

// Used for "language" param in api calls and date format
export const localeRegionAtom = atom((get) =>
	getLanguageTag(get(localeAtom), get(regionStorage)),
);

export { type Region, SUPPORTED_REGIONS };
