import {
	cookieMaxAge,
	cookieName,
	defineCustomClientStrategy,
	localStorageKey,
} from "@/paraglide/runtime";
import { matchLocale, matchLocaleFromList } from "./locale-matching";

function readSavedLocale(): string | undefined {
	const cookie = document.cookie
		.split("; ")
		.find((entry) => entry.startsWith(`${cookieName}=`));
	if (cookie) {
		return decodeURIComponent(cookie.slice(cookieName.length + 1));
	}
	return localStorage.getItem(localStorageKey) ?? undefined;
}

defineCustomClientStrategy("custom-userLocale", {
	getLocale: () => {
		const saved = readSavedLocale();
		const savedLocale = saved === undefined ? undefined : matchLocale(saved);
		return savedLocale ?? matchLocaleFromList(navigator.languages);
	},
	setLocale: (locale) => {
		document.cookie = `${cookieName}=${locale}; path=/; max-age=${cookieMaxAge}; SameSite=Lax`;
	},
});
