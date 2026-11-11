import { describe, expect, it } from "vitest";
import { matchLocale, matchLocaleFromList } from "./locale-matching";

describe("matchLocale", () => {
	it.each([
		["es-MX", "es-419"],
		["es-AR", "es-419"],
		["es-419", "es-419"],
		["es", "es-419"],
		["es-ES", "es-ES"],
		["es-es", "es-ES"],
		["pt", "pt-PT"],
		["pt-PT", "pt-PT"],
		["pt-AO", "pt-PT"],
		["pt-BR", "pt-BR"],
		["pt_br", "pt-BR"],
		["de-AT", "de"],
		["ja-JP", "ja"],
		["zh", "zh-CN"],
		["zh-CN", "zh-CN"],
		["zh-Hans-CN", "zh-CN"],
		["zh-SG", "zh-CN"],
		["zh-Hans", "zh-CN"],
		["zh-HK", "zh-TW"],
		["zh-TW", "zh-TW"],
		["zh-MO", "zh-TW"],
		["zh-Hant", "zh-TW"],
		["zh-Hant-HK", "zh-TW"],
		["zh-Hant-CN", "zh-TW"],
		["fr", "fr"],
		["fr-CA", "fr"],
		["fr-BE", "fr"],
		["en", "en"],
		["en-GB", "en"],
		["en-US", "en"],
		["ko", "ko"],
		["ko-KR", "ko"],
		["it", "it"],
		["it-CH", "it"],
	] as const)("maps %s to %s", (tag, expected) => {
		expect(matchLocale(tag)).toBe(expected);
	});

	it.each(["ru-RU", "ar", "x", "", "  "])(
		"returns undefined for unsupported tag %j",
		(tag) => {
			expect(matchLocale(tag)).toBeUndefined();
		},
	);
});

describe("matchLocaleFromList", () => {
	it("returns the first supported tag in preference order", () => {
		expect(matchLocaleFromList(["ru-RU", "es-MX", "fr"])).toBe("es-419");
		expect(matchLocaleFromList(["zh-HK", "en"])).toBe("zh-TW");
	});

	it("skips unsupported tags", () => {
		expect(matchLocaleFromList(["ru-RU", "ar-SA", "pt-AO"])).toBe("pt-PT");
	});

	it("returns undefined for an empty list", () => {
		expect(matchLocaleFromList([])).toBeUndefined();
	});

	it("returns undefined when no tag is supported", () => {
		expect(matchLocaleFromList(["ru-RU", "ar"])).toBeUndefined();
	});
});
