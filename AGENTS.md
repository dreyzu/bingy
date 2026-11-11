# Agent instructions

## i18n message keys

The frontend uses Paraglide. Messages live in `apps/frontend/messages/en.json` and `apps/frontend/messages/fr.json`.

When adding a new translatable string:

1. From `apps/frontend`, run `bun scripts/new-message-key.mjs` to get a unique key. Do not invent keys by hand.
2. Add the key with the English text to `messages/en.json` and the French text to `messages/fr.json`, using the same key in both files.
3. Use it in code as `m.<key>()`.

## UI copy

When a component has a title and a description below it, the description must not repeat the title's text. For example, an empty state titled "Empty watchlist" should not have a description that starts with or restates "empty watchlist".
