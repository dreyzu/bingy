import {
	formatDistanceToNow as dfnsFormatDistanceToNow,
	type Locale,
} from "date-fns";
import {
	de as deLocale,
	enUS as enUSLocale,
	es as esLocale,
	fr as frLocale,
	it as itLocale,
	ja as jaLocale,
	ko as koLocale,
	ptBR as ptBRLocale,
	pt as ptLocale,
	zhCN as zhCNLocale,
	zhTW as zhTWLocale,
} from "date-fns/locale";

const localeMap: Record<string, Locale> = {
	en: enUSLocale,
	es: esLocale,
	fr: frLocale,
	it: itLocale,
	ko: koLocale,
	de: deLocale,
	ja: jaLocale,
	pt: ptLocale,
	"pt-BR": ptBRLocale,
	"zh-CN": zhCNLocale,
	"zh-TW": zhTWLocale,
};

function getDateFnsLocale(locale: string): Locale {
	const [language = "en"] = locale.split("-");
	return localeMap[locale] ?? localeMap[language] ?? enUSLocale;
}

/**
 * Formats a date string into a localized date format.
 *
 * @param dateString - ISO date string or any valid date string
 * @param locale - BCP 47 language tag (default: "en-US")
 * @param options - Intl.DateTimeFormat options (default: full date with long month)
 * @returns Formatted date string
 *
 * @example
 * formatDate("2024-03-15") // "March 15, 2024"
 * formatDate("2024-03-15", "en-GB") // "15 March 2024"
 * formatDate("2024-03-15", "en-US", { month: "short", day: "numeric" }) // "Mar 15"
 */
export function formatDate(
	dateString: string,
	locale = "en-US",
	options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	},
): string {
	return new Date(dateString).toLocaleDateString(locale, options);
}

/**
 * Formats a date as a relative time string (e.g., "5 minutes ago", "2 hours ago").
 *
 * @param date - Date object or ISO date string
 * @param locale - BCP 47 language tag (default: "en-US")
 * @returns Formatted relative time string
 *
 * @example
 * formatDistanceToNow(new Date(Date.now() - 1000 * 60 * 5)) // "5 minutes ago"
 * formatDistanceToNow(new Date(Date.now() - 1000 * 60 * 60 * 2)) // "2 hours ago"
 */
export function formatDistanceToNow(date: Date, locale = "en-US"): string {
	return dfnsFormatDistanceToNow(date, {
		addSuffix: true,
		locale: getDateFnsLocale(locale),
	});
}
