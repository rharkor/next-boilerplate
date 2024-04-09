"use client"

import { useMemo } from "react"

import { TInitialDictionary } from "@/lib/langs"
import { pickFromSubset } from "@/lib/utils"
import { transformDictionaryWithFunction } from "@/lib/utils/dictionary"
import { SelectSubset } from "@/types"

import { DictionaryContext, useDictionaryReturnType } from "./context"

export default function DictionaryProvider({
  children,
  dictionary,
}: {
  children: React.ReactNode
  dictionary: TInitialDictionary
}) {
  const parsedDictionary = useMemo(() => {
    return transformDictionaryWithFunction(dictionary)
  }, [dictionary])

  const getParsedDictionary = <T extends SelectSubset<TInitialDictionary>>(subset: T): useDictionaryReturnType<T> => {
    return pickFromSubset(parsedDictionary, subset) as useDictionaryReturnType<T>
  }

  return (
    <DictionaryContext.Provider
      value={{
        dictionary: getParsedDictionary,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  )
}
