import React from "react"
import { Metadata } from "next"
import { cookies } from "next/headers"

import { fontSans } from "@/lib/fonts"
import { i18n, Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/button"
import { Link } from "@nextui-org/link"

export const metadata: Metadata = {
  title: "Not found",
}

export default async function Page404MatchAll() {
  const cookiesStore = cookies()
  const savedLocale = cookiesStore.get("saved-locale")
  const params = savedLocale?.value ? { lang: savedLocale.value } : undefined
  const dictionary = await getDictionary(params ? (params.lang as Locale) : i18n.defaultLocale, {
    notFound: true,
    goHome: true,
  })
  return (
    <html lang={params?.lang ?? i18n.defaultLocale}>
      <body
        className={cn("bg-background h-dvh min-h-dvh font-sans antialiased", fontSans.variable, fontSans.className)}
      >
        <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
          <h1 className="text-4xl font-bold">{dictionary.notFound}</h1>
          <Button as={Link} href="/" color="primary" variant="flat">
            {dictionary.goHome}
          </Button>
        </main>
      </body>
    </html>
  )
}
