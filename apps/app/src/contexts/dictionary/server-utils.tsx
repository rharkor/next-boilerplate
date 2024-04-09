"use server"

import { Locale } from "@/lib/i18n-config"
import { _getDictionary, TDictionary, TInitialDictionary } from "@/lib/langs"
import { pickFromSubset } from "@/lib/utils"
import { SelectSubset } from "@/types"
import { logger } from "@next-boilerplate/lib"

import DictionaryProvider from "./provider"

let loadedDictionary: { parsed: TDictionary; original: TInitialDictionary } | null = null
let reducedDictionary = {} as TInitialDictionary

const _loadDictionary = async (lang: Locale) => {
  logger.info("Loading dictionary")
  const dictionary = await _getDictionary(lang)
  loadedDictionary = dictionary
  return dictionary
}

export const withDictionary = async (children: React.ReactNode, { lang }: { lang: Locale }) => {
  if (!loadedDictionary) {
    await _loadDictionary(lang)
  }

  return <DictionaryProvider dictionary={reducedDictionary}>{children}</DictionaryProvider>
}

export const loadDictionary = async <T extends SelectSubset<TInitialDictionary>>(lang: Locale, subset: T) => {
  if (!loadedDictionary) {
    loadedDictionary = await _loadDictionary(lang)
  }

  reducedDictionary = pickFromSubset(loadedDictionary.original, subset) as TInitialDictionary
  return pickFromSubset(loadedDictionary.parsed, subset)
}
