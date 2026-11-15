// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { customClientStrategies } from "@/paraglide/runtime";
import "./locale-strategy";

function createMemoryStorage(): Storage {
	const data = new Map<string, string>();
	return {
		get length() {
			return data.size;
		},
		clear: () => data.clear(),
		getItem: (key) => data.get(key) ?? null,
		key: (index) => [...data.keys()][index] ?? null,
		removeItem: (key) => {
			data.delete(key);
		},
		setItem: (key, value) => {
			data.set(key, String(value));
		},
	};
}

// Node 26 exposes a localStorage getter that is undefined without --localstorage-file.
vi.stubGlobal("localStorage", createMemoryStorage());

const strategy = customClientStrategies.get("custom-userLocale");

function setBrowserLanguages(languages: string[]) {
	Object.defineProperty(navigator, "languages", {
		value: languages,
		configurable: true,
	});
}

function clearSavedLocale() {
	document.cookie =
		"PARAGLIDE_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
	localStorage.clear();
}

afterEach(() => {
	clearSavedLocale();
});

describe("custom-userLocale strategy", () => {
	it("is registered", () => {
		expect(strategy).toBeDefined();
	});

	it.each([
		[["es-MX", "en"], "es-419"],
		[["es-AR"], "es-419"],
		[["es"], "es-419"],
		[["es-ES"], "es-ES"],
		[["pt-AO"], "pt-PT"],
		[["pt-BR"], "pt-BR"],
		[["zh-HK"], "zh-TW"],
		[["zh-Hant-HK"], "zh-TW"],
		[["zh-Hans-CN"], "zh-CN"],
		[["fr-CA"], "fr"],
		[["en-GB"], "en"],
		[["ko-KR"], "ko"],
		[["de-AT"], "de"],
		[["ja-JP"], "ja"],
		[["ru-RU", "pt-BR"], "pt-BR"],
		[["ru-RU", "ar"], undefined],
		[[], undefined],
	] as const)("detects %j as %s", (languages, expected) => {
		setBrowserLanguages([...languages]);
		expect(strategy?.getLocale()).toBe(expected);
	});

	it("uses a saved cookie over the browser languages", () => {
		setBrowserLanguages(["fr-CA"]);
		document.cookie = "PARAGLIDE_LOCALE=es; path=/";
		expect(strategy?.getLocale()).toBe("es-419");
	});

	it("maps a legacy zh cookie to zh-CN", () => {
		setBrowserLanguages(["fr"]);
		document.cookie = "PARAGLIDE_LOCALE=zh; path=/";
		expect(strategy?.getLocale()).toBe("zh-CN");
	});

	it("maps a legacy es localStorage value to es-419", () => {
		setBrowserLanguages(["fr"]);
		localStorage.setItem("PARAGLIDE_LOCALE", "es");
		expect(strategy?.getLocale()).toBe("es-419");
	});

	it("ignores an unsupported saved value and falls back to the browser", () => {
		setBrowserLanguages(["pt-BR"]);
		document.cookie = "PARAGLIDE_LOCALE=ru; path=/";
		expect(strategy?.getLocale()).toBe("pt-BR");
	});

	it("writes the chosen locale to the cookie", () => {
		strategy?.setLocale("zh-TW");
		expect(document.cookie).toContain("PARAGLIDE_LOCALE=zh-TW");
	});
});
