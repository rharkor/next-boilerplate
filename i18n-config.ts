export const localesDetailed = {
  en: {
    name: "English",
    nativeName: "English",
    country: "GB",
    flag: "https://flagcdn.com/gb.svg",
  },
  fr: {
    name: "French",
    nativeName: "Français",
    country: "FR",
    flag: "https://flagcdn.com/fr.svg",
  },
} as const

export const i18n = {
  defaultLocale: "en",
  locales: Object.keys(localesDetailed) as Array<keyof typeof localesDetailed>,
} as const

export type Locale = (typeof i18n)["locales"][number]
