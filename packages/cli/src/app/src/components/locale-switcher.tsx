"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { savedLocaleCookieName } from "@/constants"
import { Locale, localesDetailed } from "@/lib/i18n-config"
import { Avatar } from "@nextui-org/avatar"
import { Select, SelectItem } from "@nextui-org/select"

export default function LocaleSwitcher({ lang }: { lang: Locale }) {
  const router = useRouter()

  const handleLocaleChange = (locale: Locale) => {
    // Change locale in cookies
    document.cookie = `${savedLocaleCookieName}=${locale};path=/`
    // Reload page
    router.refresh()
  }

  const [dynamicLocale, setDynamicLocale] = useState<Locale>(lang)

  if (!localesDetailed[lang]) return null

  return (
    <Select
      selectedKeys={[dynamicLocale]}
      onChange={(e) => {
        const locale = e.target.value as Locale | undefined
        if (!locale) return
        handleLocaleChange(locale)
        setDynamicLocale(locale)
      }}
      className="w-[150px]"
      aria-label={localesDetailed[lang].nativeName}
      startContent={<Avatar alt={lang} className="!size-4 shrink-0" src={localesDetailed[dynamicLocale].flag} />}
      size="sm"
      selectionMode="single"
    >
      {Object.entries(localesDetailed).map(([locale, details]) => (
        <SelectItem
          key={locale}
          value={locale}
          startContent={<Avatar alt={locale} className="!size-6" src={details.flag} />}
        >
          {details.nativeName}
        </SelectItem>
      ))}
    </Select>
  )
}
