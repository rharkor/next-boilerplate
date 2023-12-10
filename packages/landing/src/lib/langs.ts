import { Locale } from "i18n-config"

import { ValueOf } from "@/types"

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () => import("../langs/en.json").then((module) => module.default),
  fr: () => import("../langs/fr.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) =>
  (dictionaries[locale] as ValueOf<typeof dictionaries> | undefined)?.() ?? dictionaries.en()

export type TDictionary = Awaited<ReturnType<typeof getDictionary>>
