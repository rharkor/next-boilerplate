"use client"

import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { i18n, Locale } from "i18n-config"

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

  return (
    <Select
      value={dynamicLocale}
      onValueChange={(value: Locale) => {
        handleLocaleChange(value)
        setDynamicLocale(value)
      }}
    >
      <SelectTrigger className="w-16">
        <SelectValue placeholder="Lang" />
      </SelectTrigger>
      <SelectContent>
        {i18n.locales.map((locale) => {
          return (
            <SelectItem key={locale} value={locale}>
              {locale}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
