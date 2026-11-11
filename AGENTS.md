# Agent instructions

## i18n message keys

The frontend uses Paraglide. Messages live in `apps/frontend/messages/<locale>.json`, one file per locale: `en`, `fr`, `ko`, `zh-CN`, `zh-TW`, `es-419`, `es-ES`, `it`, `pt-BR`, `pt-PT`, `de`, and `ja`.

Never hardcode user-facing text in components. Every string the user can see goes through a message.

When adding a new translatable string:

1. From `apps/frontend`, run `bun scripts/new-message-key.mjs` to get a unique key. Do not invent keys by hand.
2. Add the key to every locale file with the translated text, using the same key everywhere. Follow the language rules below for each locale.
3. Import messages with `import { m } from "@/paraglide/messages"` and use them as `m.<key>()`.

Keep the existing tab indentation in the message files, or run Biome on them after editing.

When removing UI, delete its keys from every locale file so unused keys do not pile up.

### Locale detection

Browsers send regional locales that often do not match a message file exactly. Locale detection must map them to a supported locale instead of falling back to English:

- `es-ES` → `es-ES`. Every other Spanish locale (`es-MX`, `es-AR`, `es-CO`, `es-US`, plain `es`, etc.) → `es-419`.
- `pt-BR` → `pt-BR`. Every other Portuguese locale (`pt-PT`, `pt-AO`, `pt-MZ`, plain `pt`, etc.) → `pt-PT`.
- Traditional Chinese locales (`zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant` and its regional forms) → `zh-TW`. Every other Chinese locale (`zh-CN`, `zh-SG`, `zh-Hans`, plain `zh`, etc.) → `zh-CN`.
- Every regional variant of the other languages (`fr-CA`, `fr-BE`, `it-CH`, `en-GB`, `de-AT`, `de-CH`, `ja-JP`, etc.) → its base locale.

When adding a locale, update this mapping in the code and in this list.

### Dynamic values

Use message parameters for dynamic values:

```json
{
	"quiet_amber_heron": "Hello {name}"
}
```

```ts
m.quiet_amber_heron({ name });
```

Never build a sentence by concatenating translated fragments or appending values to a message (`m.key() + name`). Word order differs between languages, so the whole sentence must live in one message.

### One message per context

**Do not share a message across unrelated contexts.** Random keys are not an invitation to reuse one message everywhere. Two buttons might both say OK today but evolve independently tomorrow. If they share a key, changing one button to Delete or Got it also changes the other.

Give independently evolving messages their own IDs, even when their current source text is identical:

```json
{
	"calm_green_otter": "OK",
	"bright_coral_fox": "OK"
}
```

## Language rules

### French

French messages (`messages/fr.json`) use the informal address (tutoiement): use `tu`, `ton`, `ta`, `tes`, and the matching verb forms, never `vous`, `votre`, or `vos`.

Instructional text that explains how to do something uses the imperative, for example "Ajoute un film" or "Clique sur le bouton". With `tu`, `-er` verbs take no final `-s` in the imperative: write "Ajoute", never "Ajoutes".

Follow French typography:

- Put a non-breaking space (U+00A0) before `?`, `!`, `:`, and `;`.
- Use `«` and `»` for quotes, with a non-breaking space inside each mark.
- Use the typographic apostrophe `’`, not `'`.

### Korean

Korean messages (`messages/ko.json`) never use informal speech (반말). Use polite speech (존댓말, 해요체 such as `~해요` and `~하세요`).

Never end a sentence with a casual ending such as `~해`, `~야`, or `~니`. For example, write `저장해요`, never `저장해`.

Instructional text that explains how to do something uses the polite imperative (`~하세요`).

### Chinese

There are two separate Chinese locales. Never convert a message from one into the other character by character: vocabulary differs too.

Both share these rules:

- Address the user with `你`, never `您`.
- Instructional text uses short direct imperatives. Do not add `请`/`請` everywhere; keep it for real requests.
- Use full-width punctuation: `，` `。` `？` `！` `：` `；`. Never use half-width `,` `.` `?` `!` in Chinese text.
- Put a space between Chinese characters and Latin letters or numbers, for example `添加 3 部电影` or `打开 Bingy`. Put no spaces between Chinese characters.

#### Simplified Chinese

Simplified Chinese messages (`messages/zh-CN.json`) use Simplified characters and mainland vocabulary, for example `视频`, `软件`, `网络`, and `账号`. Never use Traditional characters.

Instructional text examples: `点击按钮`, `添加电影`.

Use `“` and `”` for quotes.

#### Traditional Chinese

Traditional Chinese messages (`messages/zh-TW.json`) use Traditional characters and Taiwan vocabulary, for example `影片` (not `視頻`), `軟體` (not `軟件`), `網路` (not `網絡`), and `帳號` (not `賬號`). Never use Simplified characters.

Instructional text examples: `點選按鈕`, `新增電影`.

Use `「` and `」` for quotes, and `『` and `』` for quotes inside quotes.

### Spanish

There are two separate Spanish locales. Never copy a message from one into the other without adapting it: vocabulary and plural address differ.

Both share these rules:

- Address a single user with `tú`, `tu`, and `tus`, never `usted` or `su`.
- Always open questions and exclamations with `¿` and `¡`.

#### Latin American Spanish

Latin American Spanish messages (`messages/es-419.json`) use neutral Latin American Spanish that reads naturally in Mexico and across the region. Avoid Spain-only words, for example write `computadora` (not `ordenador`), `celular` (not `móvil`), and `video` (not `vídeo`).

Address several people with `ustedes`, never `vosotros`.

Instructional text uses the `tú` imperative, for example "Agrega una película" or "Haz clic en el botón".

Use `“` and `”` for quotes.

#### European Spanish

European Spanish messages (`messages/es-ES.json`) use Spain vocabulary, for example `ordenador` (not `computadora`), `móvil` (not `celular`), and `vídeo` (not `video`).

Address several people with `vosotros`, never `ustedes`.

Instructional text uses the `tú` imperative, for example "Añade una película" or "Haz clic en el botón".

Use `«` and `»` for quotes, with no space inside the marks.

### Italian

Italian messages (`messages/it.json`) use the informal address (`tu`, `tuo`, `tua`, `tuoi`, `tue`), never `Lei` or `Suo`.

Instructional text uses the `tu` imperative, for example "Aggiungi un film" or "Clicca sul pulsante".

Follow Italian typography:

- Use the typographic apostrophe `’`, not `'`.
- Write accented capitals properly: `È`, never `E'`.
- Use `«` and `»` for quotes, with no space inside the marks.

### Portuguese

There are two separate Portuguese locales. Never copy a message from one into the other without adapting it: vocabulary, address, and verb forms differ.

Both use the current spelling from the 1990 Orthographic Agreement, for example `ação` (not `acção`) and `ótimo` (not `óptimo`).

Both follow the same typography:

- Use the typographic apostrophe `’`, not `'`.
- Put no space before `?`, `!`, `:`, or `;`.

#### Brazilian Portuguese

Brazilian Portuguese messages (`messages/pt-BR.json`) use Brazilian vocabulary, for example `tela`, `celular`, `usuário`, and `arquivo`.

Address the user with `você`, never `tu` or `o senhor`/`a senhora`.

Instructional text uses the imperative that matches `você`, for example "Adicione um filme" or "Clique no botão".

Use `“` and `”` for quotes.

#### European Portuguese

European Portuguese messages (`messages/pt-PT.json`) use European vocabulary, for example `ecrã` (not `tela`), `telemóvel` (not `celular`), `utilizador` (not `usuário`), and `ficheiro` (not `arquivo`).

Address the user with `tu` and its verb forms, never `você` or `o senhor`/`a senhora`.

Instructional text uses the `tu` imperative, for example "Adiciona um filme" or "Clica no botão".

Use `«` and `»` for quotes, with no space inside the marks.

### German

German messages (`messages/de.json`) use the informal address (`du`, `dein`, `deine`, `dich`, `dir`, and `ihr`/`euch` for several people), never `Sie` or `Ihr`. Write the pronouns in lowercase: `du`, never `Du`.

Instructional text uses the `du` imperative, for example "Füge einen Film hinzu" or "Klicke auf die Schaltfläche".

Use standard German spelling as used in Germany, including `ß` (for example `Straße`, `groß`), not the Swiss `ss`.

Follow German typography:

- Use `„` and `“` for quotes, and `‚` and `‘` for quotes inside quotes.
- Use the typographic apostrophe `’`, not `'`.
- Put no space before `?`, `!`, `:`, or `;`.

### Japanese

Japanese messages (`messages/ja.json`) use the polite form (です/ます調) in sentences. Do not mix it with the plain form (だ/である調) in the same message, and avoid honorific or humble keigo (尊敬語/謙譲語) beyond that.

Never address the user as `あなた`. Leave the subject implicit, as natural Japanese does.

Instructional text uses `〜してください`, for example `映画を追加してください` or `ボタンをクリックしてください`. Short UI labels such as buttons use the noun or verb stem without `してください`, for example `追加` or `保存`.

Write loanwords in katakana with the long vowel mark, for example `ユーザー`, `サーバー`, and `フォルダー`.

Follow Japanese typography:

- Use full-width punctuation: `、` `。` `？` `！` `：`. Never use half-width `,` `.` `?` `!` in Japanese text.
- Use half-width digits and Latin letters, with no space between them and Japanese characters, for example `3本の映画` or `Bingyを開く`.
- Use `「` and `」` for quotes, and `『` and `』` for quotes inside quotes.

## UI copy

When a component has a title and a description below it, the description must not repeat the title's text. For example, an empty state titled "Empty watchlist" should not have a description that starts with or restates "empty watchlist".