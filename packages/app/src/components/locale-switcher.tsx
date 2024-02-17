"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { Locale, localesDetailed } from "i18n-config"

import { Avatar, Select, SelectItem } from "@nextui-org/react"

export default function LocaleSwitcher({ lang }: { lang: Locale }) {
  const pathName = usePathname()
  const router = useRouter()
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return "/"
    const segments = pathName.split("/")
    segments[1] = locale
    return segments.join("/")
  }

  const handleLocaleChange = (locale: Locale) => {
    router.push(redirectedPathName(locale))
    //? refresh the page due to prefetch <Link/>
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
      startContent={<Avatar alt={lang} className="!size-4 shrink-0" src={localesDetailed[lang].flag} />}
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
