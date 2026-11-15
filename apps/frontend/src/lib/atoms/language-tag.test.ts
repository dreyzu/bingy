import { describe, expect, it } from "vitest";
import { getLanguageTag } from "./language-tag";

describe("getLanguageTag", () => {
	it.each([
		["en", "US", "en-US"],
		["en", "GB", "en-GB"],
		["en", "AU", "en-AU"],
		["en", "CA", "en-CA"],
		["fr", "FR", "fr-FR"],
		["fr", "CA", "fr-CA"],
		["ko", "KR", "ko-KR"],
		["it", "IT", "it-IT"],
	] as const)(
		"keeps the base locale and a valid region: %s + %s",
		(locale, region, expected) => {
			expect(getLanguageTag(locale, region)).toBe(expected);
		},
	);

	it.each([
		["en", "MX", "en-US"],
		["fr", "US", "fr-FR"],
		["ko", "FR", "ko-KR"],
		["it", "US", "it-IT"],
	] as const)(
		"falls back to the default region when the region is invalid: %s + %s",
		(locale, region, expected) => {
			expect(getLanguageTag(locale, region)).toBe(expected);
		},
	);

	it.each([
		["es-419", "MX", "es-MX"],
		["es-419", "US", "es-MX"],
		["es-ES", "ES", "es-ES"],
		["es-ES", "US", "es-ES"],
		["pt-BR", "PT", "pt-BR"],
		["pt-PT", "BR", "pt-PT"],
		["zh-CN", "TW", "zh-CN"],
		["zh-TW", "US", "zh-TW"],
	] as const)(
		"uses the regional locale tag, ignoring the region: %s + %s",
		(locale, region, expected) => {
			expect(getLanguageTag(locale, region)).toBe(expected);
		},
	);
});
