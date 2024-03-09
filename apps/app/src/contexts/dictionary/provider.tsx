"use client"

import { createHash } from "crypto"

import { Locale } from "@/lib/i18n-config"
import { getDictionary, TDictionary } from "@/lib/langs"
import { logger } from "@lib/logger"

import { DictionaryContext } from "./context"

export default function DictionaryProvider({
  children,
  dictionary: _dictionary,
  dictionaryHash,
  lang,
}: {
  children: React.ReactNode
  dictionary: TDictionary | undefined
  dictionaryHash: string
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

  const removeDictFromCookies = () => {
    const cookies = document.cookie
    const i18nLoadedContent = cookies.split(";").find((cookie) => cookie.includes("i18n-l"))
    const i18nLoadedValue = i18nLoadedContent?.split("=")[1]
    if (!i18nLoadedValue) return
    const parsed = i18nLoadedValue.split(",") as string[]
    const withoutLang = parsed.filter((lang) => lang !== lang)
    // Remove the dicitonary from the i18n-l list
    document.cookie = `i18n-l=${withoutLang.join(",")}; max-age=31536000; path=/`
    window.location.reload()
  }

  if (_dictionary) {
    localStorage.setItem(`dictionary:${lang}`, JSON.stringify(_dictionary))
    // Append the dictionary
    const cookies = document.cookie
    const i18nLoadedContent = cookies.split(";").find((cookie) => cookie.includes("i18n-l"))
    const i18nLoadedValue = i18nLoadedContent?.split("=")[1]
    if (!i18nLoadedValue) {
      document.cookie = `i18n-l=${lang}; max-age=31536000; path=/`
    } else {
      // Set a cookie to indicate that the dictionary has been loaded
      const parsed = i18nLoadedValue.split(",") as string[]
      if (!parsed.includes(lang)) {
        parsed.push(lang)
        document.cookie = `i18n-l=${parsed.join(",")}; max-age=31536000; path=/`
      }
    }
  }
  // This can happend only if the use has deleted the local storage but the cookie is still there
  else if (!localStorage.getItem(`dictionary:${lang}`)) {
    // Remove the cookie if the dictionary is not loaded
    logger.error("Dictionary not loaded")
    removeDictFromCookies()
  }

  // Handle dictionary update
  if (!_dictionary && localStorage.getItem(`dictionary:${lang}`)) {
    const savedDict = JSON.parse(localStorage.getItem(`dictionary:${lang}`) as string) as TDictionary
    const savedHash = createHash("sha256").update(JSON.stringify(savedDict)).digest("hex")
    if (savedHash !== dictionaryHash) {
      removeDictFromCookies()
    }
  }

  const dictionary = _dictionary ?? (JSON.parse(localStorage.getItem(`dictionary:${lang}`) as string) as TDictionary)

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
