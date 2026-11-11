// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("getRegionFromTimezone", () => {
	it.each([
		["America/Sao_Paulo", "BR"],
		["America/Manaus", "BR"],
		["America/Fortaleza", "BR"],
		["America/Bahia", "BR"],
		["America/Mexico_City", "MX"],
		["America/Monterrey", "MX"],
		["America/Cancun", "MX"],
		["America/Tijuana", "MX"],
		["America/Toronto", "CA"],
		["America/New_York", "US"],
		["America/Argentina/Buenos_Aires", "US"],
		["Europe/Paris", "FR"],
		["Europe/London", "GB"],
		["Europe/Rome", "IT"],
		["Europe/Madrid", "ES"],
		["Europe/Lisbon", "PT"],
		["Australia/Sydney", "AU"],
		["Asia/Seoul", "KR"],
		["Asia/Taipei", "TW"],
		["UTC", undefined],
	] as const)("maps %s to %s", async (timezone, expected) => {
		const { getRegionFromTimezone } = await import("./region");
		expect(getRegionFromTimezone(timezone)).toBe(expected);
	});
});

describe("stored region", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.resetModules();
	});

	it("keeps a valid stored region", async () => {
		localStorage.setItem("region", JSON.stringify("FR"));
		await import("./region");
		expect(localStorage.getItem("region")).toBe(JSON.stringify("FR"));
	});

	it("replaces an unsupported stored region with a detected one", async () => {
		localStorage.setItem("region", JSON.stringify("XX"));
		const { SUPPORTED_REGIONS } = await import("./region");
		const saved: unknown = JSON.parse(localStorage.getItem("region") ?? "null");
		expect(SUPPORTED_REGIONS.some((region) => region === saved)).toBe(true);
	});

	it("replaces malformed stored JSON with a detected region", async () => {
		localStorage.setItem("region", "{not json");
		const { SUPPORTED_REGIONS } = await import("./region");
		const saved: unknown = JSON.parse(localStorage.getItem("region") ?? "null");
		expect(SUPPORTED_REGIONS.some((region) => region === saved)).toBe(true);
	});
});
