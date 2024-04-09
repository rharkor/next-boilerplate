"use client"

import { createContext } from "react"

import { TDictionary, TInitialDictionary } from "@/lib/langs"
import { DictionaryWithFunction } from "@/lib/utils/dictionary"
import { PickFromSubset, SelectSubset } from "@/types"

export type TDictionaryContext = {
  dictionary: <T extends SelectSubset<TInitialDictionary> | undefined = undefined>(
    subset: T
  ) => useDictionaryReturnType<T>
}

export type useDictionaryReturnType<T extends SelectSubset<TInitialDictionary> | undefined = undefined> =
  T extends undefined ? DictionaryWithFunction<TInitialDictionary> : PickFromSubset<TDictionary, NonNullable<T>>

export const DictionaryContext = createContext<TDictionaryContext | undefined>(undefined)
