"use server"

import { Locale } from "@/lib/i18n-config"
import { _getDictionary, TDictionary, TInitialDictionary } from "@/lib/langs"
import { mergeDeep, pickFromSubset } from "@/lib/utils"
import { SelectSubset } from "@/types"

import DictionaryProvider from "./provider"

let loadedDictionary: { parsed: TDictionary; original: TInitialDictionary } | null = null
let reducedDictionary = {} as TInitialDictionary

const _loadDictionary = async (lang: Locale) => {
  const dictionary = await _getDictionary(lang)
  loadedDictionary = dictionary
  return dictionary
}

export const withDictionary = async (children: React.ReactNode, { lang }: { lang: Locale }) => {
  await getDictionary(
    lang,
    // Default needs
    {
      somethingWentWrong: true,
      tryAgain: true,
      // All errors needed for trpc, will be removed soon
      //TODO Rewrite trpc error handling
      errors: true,
    }
  )

  return <DictionaryProvider dictionary={reducedDictionary}>{children}</DictionaryProvider>
}

let previousSubset = {} as SelectSubset<TInitialDictionary>
export const getDictionary = async <T extends SelectSubset<TInitialDictionary>>(lang: Locale, _subset: T) => {
  if (!loadedDictionary) {
    loadedDictionary = await _loadDictionary(lang)
  }
  const subset = mergeDeep(previousSubset, _subset)
  previousSubset = subset
  reducedDictionary = pickFromSubset(loadedDictionary.original, subset) as TInitialDictionary
  return pickFromSubset(loadedDictionary.parsed, subset)
}
