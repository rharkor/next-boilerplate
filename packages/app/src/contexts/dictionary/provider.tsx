"use client"

import { TDictionary } from "@/lib/langs"

import { DictionaryContext } from "./context"

export default function DictionaryProvider({
  children,
  dictionary,
}: {
  children: React.ReactNode
  dictionary: TDictionary
}) {
  return (
    <DictionaryContext.Provider
      value={{
        dictionary,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  )
}
