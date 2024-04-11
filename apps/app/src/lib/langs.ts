import { Locale } from "@/lib/i18n-config"
import { PickFromSubset, SelectSubset, UnionToIntersection, ValueOf } from "@/types"

import { merge, pickFromSubset } from "./utils"

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

export type TBaseDict = Awaited<ReturnType<ValueOf<typeof dictionaries>>>
// Do not specify a default value for P in order to force users to specify the dictionary subset
export type TDictionary<P extends SelectSubset<TBaseDict> | undefined> =
  P extends SelectSubset<TBaseDict> ? PickFromSubset<TBaseDict, P> : TBaseDict

const dictionaryCache = new Map<Locale, TDictionary<undefined>>()

export const getDictionary = async <
  P1 extends SelectSubset<TBaseDict>,
  P2 extends SelectSubset<TBaseDict>[],
  P extends P2 extends [] ? P1 : P1 & UnionToIntersection<P2[number]>,
>(
  locale: Locale,
  dictionaryRequirement: P1,
  ...dictionaryRequirements: P2
): Promise<PickFromSubset<TDictionary<undefined>, P>> => {
  const requirements =
    dictionaryRequirements.length > 0
      ? merge(dictionaryRequirement, ...dictionaryRequirements)
      : (dictionaryRequirement as unknown as P)

  const cached = dictionaryCache.get(locale)
  if (cached) return pickFromSubset(cached, requirements) as PickFromSubset<TDictionary<undefined>, P>

  const loadedDictionary = await ((dictionaries[locale] as ValueOf<typeof dictionaries> | undefined)?.() ??
    dictionaries.en())

  dictionaryCache.set(locale, loadedDictionary)

  const parsedDictionary = pickFromSubset(loadedDictionary, requirements)
  return parsedDictionary as PickFromSubset<TDictionary<undefined>, P>
}
