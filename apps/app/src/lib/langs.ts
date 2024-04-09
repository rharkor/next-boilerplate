import { loadDictionary } from "@/contexts/dictionary/server-utils"
import { Locale } from "@/lib/i18n-config"
import { ValueOf } from "@/types"

import { DictionaryWithFunction, transformDictionaryWithFunction } from "./utils/dictionary"

const dictionaries = {
  en: () => import("../langs/en.json").then((module) => module.default),
  fr: () => import("../langs/fr.json").then((module) => module.default),
}

// Ensure all locales have a dictionary
const allLocales = Object.keys(dictionaries) as Locale[]
for (const locale of allLocales) {
  if (!dictionaries[locale]) {
    throw new Error(`Missing dictionary for locale: ${locale}`)
  }
}

export type TInitialDictionary = Awaited<ReturnType<ValueOf<typeof dictionaries>>>
export type TDictionary = DictionaryWithFunction<TInitialDictionary>

const dictionaryCache = new Map<Locale, { parsed: TDictionary; original: TInitialDictionary }>()

export const _getDictionary = async (locale: Locale) => {
  const cached = dictionaryCache.get(locale)
  if (cached) return cached

  const loadedDictionary = await ((dictionaries[locale] as ValueOf<typeof dictionaries> | undefined)?.() ??
    dictionaries.en())
  const transformedDictionary = transformDictionaryWithFunction(loadedDictionary)

  dictionaryCache.set(locale, {
    parsed: transformedDictionary,
    original: loadedDictionary,
  })

  return {
    parsed: transformedDictionary,
    original: loadedDictionary,
  }
}

// Alias of loadDictionary
export const getDictionary = loadDictionary
