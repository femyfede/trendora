import "server-only";

import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, normalizeLanguage, pick, translate, type TranslationKey } from "./i18n";
import type { Language } from "./types";

/** The visitor's language, read from the language cookie. Defaults to Kiswahili. */
export async function getLanguage(): Promise<Language> {
  try {
    return normalizeLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);
  } catch {
    return "sw";
  }
}

/** Server-side helpers: `tr(en, sw)` for inline copy and `t(key)` for dictionary entries. */
export async function getTranslator() {
  const language = await getLanguage();
  return {
    language,
    tr: (en: string, sw: string) => pick(language, en, sw),
    t: (key: TranslationKey) => translate(key, language)
  };
}
