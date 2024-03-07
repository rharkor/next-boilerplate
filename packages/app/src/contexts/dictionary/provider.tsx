"use client"

import { Locale } from "i18n-config"

import { getDictionary, TDictionary } from "@/lib/langs"
import { logger } from "@lib/logger"

import { DictionaryContext } from "./context"

export default function DictionaryProvider({
  children,
  dictionary: _dictionary,
  lang,
}: {
  children: React.ReactNode
  dictionary: TDictionary | undefined
  lang: Locale
}) {
  const isSSR = typeof window === "undefined"

  if (isSSR) {
    //* What a trick !
    return (async () => {
      const dictionary = await getDictionary(lang)
      return (
        <DictionaryContext.Provider
          value={{
            dictionary,
          }}
        >
          {children}
        </DictionaryContext.Provider>
      )
    })()
  }

  if (_dictionary) {
    localStorage.setItem("dictionary", JSON.stringify(_dictionary))
    // Set a cookie to indicate that the dictionary has been loaded
    document.cookie = "i18n-loaded=true; max-age=31536000; path=/"
  }
  // This can happend only if the use has deleted the local storage but the cookie is still there
  else if (!localStorage.getItem("dictionary")) {
    // Remove the cookie if the dictionary is not loaded
    logger.error("Dictionary not loaded")
    document.cookie = "i18n-loaded=; max-age=0; path=/"
    window.location.reload()
  }

  // Handle unexpected errors
  const dictionary = _dictionary ?? (JSON.parse(localStorage.getItem("dictionary") as string) as TDictionary)

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
