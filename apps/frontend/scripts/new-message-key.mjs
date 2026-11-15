// Prints a new unique message key (e.g. "calm_amber_fox") that is not already in messages/en.json.
//
// Usage: node scripts/new-message-key.mjs [count]
// Output: one key per line, nothing else, so it can be piped or read by an agent.

import { randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const existing = new Set(
	Object.keys(
		JSON.parse(readFileSync(path.join(root, "messages", "en.json"), "utf8")),
	),
);
const count = Number(process.argv[2] ?? 1);

// biome-ignore format: keep compact word grid
const adjectives = [
	"calm", "bright", "quiet", "swift", "gentle", "bold", "brave", "cozy", "eager", "fancy",
	"golden", "happy", "jolly", "keen", "lively", "lucky", "merry", "mighty", "noble", "proud",
	"rapid", "silent", "smart", "sunny", "tender", "vivid", "warm", "wise", "witty", "zesty",
	"agile", "airy", "alert", "ample", "balmy", "breezy", "brisk", "bubbly", "candid", "chilly",
	"clever", "crisp", "daring", "dapper", "dreamy", "dusky", "earthy", "elegant", "epic", "fair",
	"fierce", "fluffy", "frosty", "gallant", "gleeful", "glossy", "grand", "hardy", "hasty", "hazy",
	"humble", "icy", "jaunty", "joyful", "kind", "lean", "light", "loyal", "lush", "mellow",
	"modest", "nimble", "nifty", "peppy", "plucky", "polite", "primal", "quick", "rustic", "shiny",
	"snappy", "spry", "steady", "stellar", "sturdy", "sweet", "tidy", "upbeat", "velvet", "vibrant",
	"wild", "winsome", "zippy",
];

// biome-ignore format: keep compact word grid
const colors = [
	"amber", "azure", "coral", "crimson", "emerald", "indigo", "ivory", "jade", "lemon", "lilac",
	"maroon", "mint", "navy", "olive", "orange", "pearl", "plum", "purple", "ruby", "silver",
	"teal", "violet", "white", "yellow", "aqua", "beige", "bronze", "cerise", "cobalt", "copper",
	"cream", "fuchsia", "gold", "gray", "green", "hazel", "khaki", "lavender", "lime", "magenta",
	"mauve", "ochre", "peach", "periwinkle", "pink", "rose", "rust", "saffron", "sage", "sapphire",
	"scarlet", "sepia", "sienna", "slate", "tan", "topaz", "turquoise", "umber", "wine", "onyx",
];

// biome-ignore format: keep compact word grid
const nouns = [
	"badger", "beaver", "comet", "dolphin", "eagle", "falcon", "fox", "gecko", "heron", "hippo",
	"iguana", "jaguar", "koala", "lemur", "lynx", "marmot", "meerkat", "moose", "narwhal", "octopus",
	"otter", "panda", "penguin", "puma", "quail", "raven", "salmon", "seal", "tiger", "walrus",
	"whale", "wolf", "yak", "zebra", "acorn", "anchor", "arrow", "aspen", "bagel", "bamboo",
	"banjo", "barn", "basil", "beacon", "biscuit", "blossom", "boulder", "bridge", "cactus", "canyon",
	"cedar", "cherry", "cloud", "clover", "compass", "coral", "cricket", "crystal", "daisy", "dune",
	"ember", "fern", "flute", "forest", "galaxy", "garden", "glacier", "harbor", "hazel", "island",
	"jasmine", "kettle", "lagoon", "lantern", "maple", "meadow", "mesa", "mirror", "nectar", "oasis",
	"orchid", "parrot", "pebble", "pelican", "pine", "planet", "prairie", "rabbit", "rocket", "saddle",
	"spruce", "squirrel", "sunflower", "tulip", "turtle", "valley", "violin", "willow", "wombat", "yarn",
];

const pick = (list) => list[randomInt(list.length)];
const lines = [];

while (lines.length < count) {
	const key = `${pick(adjectives)}_${pick(colors)}_${pick(nouns)}`;
	if (!existing.has(key)) {
		existing.add(key);
		lines.push(key);
	}
}

console.log(lines.join("\n"));
