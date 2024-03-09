"use client"

import { createContext } from "react"

import { TDictionary } from "@/lib/langs"

export type TDictionaryContext = {
  dictionary: TDictionary
}

export const DictionaryContext = createContext<TDictionaryContext | undefined>(undefined)
