import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

/**
 * Formats a runtime in minutes as a localized duration.
 * The exact unit text comes from the browser's locale data and can vary between browsers.
 *
 * @example
 * formatRuntime(65) // en: "1h 5m"
 * formatRuntime(45) // en: "45m"
 */
export function formatRuntime(minutes: number | null): string {
	if (!minutes || minutes <= 0) return m.alert_sienna_cherry();

	const locale = getLocale();
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if ("DurationFormat" in Intl) {
		return new Intl.DurationFormat(locale, { style: "narrow" }).format({
			hours,
			minutes: remainingMinutes,
		});
	}

	// Older browsers without Intl.DurationFormat: fall back to total minutes.
	return new Intl.NumberFormat(locale, {
		style: "unit",
		unit: "minute",
		unitDisplay: "narrow",
	}).format(minutes);
}

/**
 * Formats a number of minutes as localized hours with at most one decimal.
 * The exact unit text comes from the browser's locale data and can vary between browsers.
 *
 * @example
 * formatRuntimeHours(750) // en: "12.5h"
 */
export function formatRuntimeHours(minutes: number): string {
	return new Intl.NumberFormat(getLocale(), {
		style: "unit",
		unit: "hour",
		unitDisplay: "narrow",
		maximumFractionDigits: 1,
	}).format(minutes / 60);
}
