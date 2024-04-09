import { useContext } from "react"

import { TInitialDictionary } from "@/lib/langs"
import { SelectSubset } from "@/types"

import { DictionaryContext } from "./context"

/**
 * Get the dictionary
 * @param subset Specific dictionary subset (optional), it can be usefull to know exactly what dictionary keys are provided by the server
 * @returns
 */
export const useDictionary = <T extends SelectSubset<TInitialDictionary>>(subset?: T) => {
  const context = useContext(DictionaryContext)
  if (context === undefined) {
    throw new Error("useDictionary must be used within a DictionaryProvider")
  }
  return context.dictionary(subset)
}
