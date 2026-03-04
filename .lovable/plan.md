

# Add German (DE) translation + make all 3 languages work across the platform

## Current State

- **Language type** supports `fr | en | es | it | zh | ja` but only `fr` and `en` have locale files
- **`t()` system** (JSON-based): works for `fr`/`en` via `locales/{lang}/common.json`, but is used in very few places
- **`TranslatedText` component**: used in **48 files (~1000 occurrences)** with hardcoded French strings. It calls `translate()` which is currently a **no-op** (returns the original text unchanged). So switching to English shows French text everywhere.
- **German**: no locale file, not in the switch statement

## Plan

### 1. Trim languages to FR / EN / DE only

In `src/contexts/LanguageContext.tsx`:
- Change `Language` type to `'fr' | 'en' | 'de'`
- Reduce `LANGUAGES` array to 3 entries (FR, EN, DE with flag `🇩🇪`)
- Add `case 'de'` in the switch that loads locale JSON

### 2. Create `src/locales/de/common.json`

Full German translation of all keys currently in `en/common.json` and `fr/common.json` (nav, common, generator, home sections).

### 3. Create a static translation dictionary for `TranslatedText`

Create `src/locales/translations-dictionary.ts` containing a `Record<string, Record<string, string>>` mapping every French string used in `TranslatedText` to its EN and DE equivalent. Example:

```ts
export const TRANSLATIONS_DICT: Record<string, Record<string, string>> = {
  "Accueil": { en: "Home", de: "Startseite" },
  "Retour": { en: "Back", de: "Zurück" },
  "Générer la musique": { en: "Generate music", de: "Musik generieren" },
  // ... ~200 entries covering all TranslatedText usages
};
```

### 4. Make `translate()` use the dictionary

In `LanguageContext.tsx`, update the `translate()` function to look up the French string in the dictionary and return the target language version. No API call needed -- pure static lookup with French fallback.

### 5. Expand `en/common.json` and `fr/common.json`

Add any missing keys to ensure the `t()` system also covers all sections (already mostly complete).

## Files to create/modify

| File | Action |
|------|--------|
| `src/contexts/LanguageContext.tsx` | Trim to 3 langs, add `de` case, update `translate()` |
| `src/locales/de/common.json` | Create (German translations) |
| `src/locales/translations-dictionary.ts` | Create (~200 FR→EN/DE mappings) |
| `src/contexts/index.ts` | No change needed (re-exports are generic) |

## Expected result

- Language selector shows only FR / EN / DE
- Switching language translates **all** text across the platform instantly (no API, no latency)
- Both `t()` and `TranslatedText` systems work for all 3 languages

