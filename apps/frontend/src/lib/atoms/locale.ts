import { atom } from "jotai";
import "@/lib/locale-strategy";
import { getLocale, type Locale, setLocale } from "@/paraglide/runtime";

const initialLocale = getLocale();
document.documentElement.lang = initialLocale;

export const localeAtom = atom<Locale>(initialLocale);

export const setLocaleAtom = atom(null, (_get, set, newLocale: Locale) => {
	setLocale(newLocale);
	document.documentElement.lang = newLocale;
	set(localeAtom, newLocale);
});
