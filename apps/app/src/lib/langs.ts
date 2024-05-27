import { Locale } from "@/lib/i18n-config"
import { PickFromSubset, SelectSubset } from "@/types"

import { pickFromSubset } from "./utils"

const dictionaries = {
  default: {
    en: () => import("../langs/en.json").then((module) => module.default),
    fr: () => import("../langs/fr.json").then((module) => module.default),
  },
  errors: {
    en: () => import("../langs/errors/en.json").then((module) => module.default),
    fr: () => import("../langs/errors/fr.json").then((module) => module.default),
  },
  transactionals: {
    en: () => import("../langs/transactionals/en.json").then((module) => module.default),
    fr: () => import("../langs/transactionals/fr.json").then((module) => module.default),
  },
}

export type TPossibleNamespaces = keyof typeof dictionaries
export type TBaseDict<NS extends TPossibleNamespaces> = Awaited<ReturnType<(typeof dictionaries)[NS][Locale]>>
// Just add the possibility of already cached dictionaries
type TDictionariesWithCache = {
  [key in keyof typeof dictionaries]: {
    [lkey in Locale]: (() => Promise<TBaseDict<key>>) | TBaseDict<key>
  }
}

// Do not specify a default value for P in order to force users to specify the dictionary subset
export type TDictionary<P extends SelectSubset<TBaseDict<NS>> | undefined, NS extends TPossibleNamespaces = "default"> =
  P extends SelectSubset<TBaseDict<NS>> ? PickFromSubset<TBaseDict<NS>, P> : TBaseDict<NS>

type GetDictionaryReturnType<
  P extends SelectSubset<MD> | undefined,
  NS extends TPossibleNamespaces,
  MD extends TDictionary<undefined, NS> = TDictionary<undefined, NS>,
> = Promise<P extends SelectSubset<MD> ? PickFromSubset<MD, P> : MD>
export const _getDictionary = async <
  P extends SelectSubset<MD> | undefined,
  NS extends TPossibleNamespaces,
  MD extends TDictionary<undefined, NS> = TDictionary<undefined, NS>,
>(
  subset: NS,
  locale: Locale,
  dictionaryRequirements: P
): GetDictionaryReturnType<P, NS, MD> => {
  const dict = (dictionaries as TDictionariesWithCache)[subset][locale]
  // Dict already loaded
  if (typeof dict !== "function") {
    if (!dictionaryRequirements) return dict as unknown as GetDictionaryReturnType<P, NS, MD>
    return pickFromSubset(dict, dictionaryRequirements) as unknown as GetDictionaryReturnType<P, NS, MD>
  }
  // Load the dictionary
  // logger.info(`Loading dictionary ${subset} for locale ${locale}`)
  const loadedDictionary = await dict()
  const dTyped = dictionaries as TDictionariesWithCache
  dTyped[subset][locale] = loadedDictionary
  if (!dictionaryRequirements) return loadedDictionary as unknown as GetDictionaryReturnType<P, NS, MD>
  const parsedDictionary = pickFromSubset(loadedDictionary, dictionaryRequirements)
  return parsedDictionary as unknown as GetDictionaryReturnType<P, NS, MD>
}

export const getDictionary = async <
  P extends SelectSubset<MD> | undefined,
  NS extends TPossibleNamespaces = "default",
  MD extends TDictionary<undefined, NS> = TDictionary<undefined, NS>,
>(
  locale: Locale,
  dictionaryRequirements: P
): GetDictionaryReturnType<P, NS, MD> => {
  return _getDictionary("default" as NS, locale, dictionaryRequirements)
}
