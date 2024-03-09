import React from "react"
import { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createHash } from "crypto"

import { fontSans } from "@/lib/fonts"
import { i18n, Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"

import RootProviders from "./providers"

import "../globals.css"

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Next.js boilerplate",
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  //? If locale is not found, return 404
  if (!i18n.locales.includes(params.lang)) return redirect(`/${i18n.defaultLocale}/${params.lang}`)

  const dictionary = await getDictionary(params.lang as Locale)
  const dictionaryHash = createHash("sha256").update(JSON.stringify(dictionary)).digest("hex")

  const cookiesStore = cookies()
  const loadedDicts = cookiesStore.get("i18n-l")
  const hasDictLoaded = loadedDicts ? loadedDicts.value.split(",").includes(params.lang) : false

  return (
    <html lang={params.lang}>
      <body className={cn("antialiaseds bg-background min-h-screen font-sans", fontSans.variable)}>
        <RootProviders
          dictionary={hasDictLoaded ? undefined : dictionary}
          lang={params.lang as Locale}
          dictionaryHash={dictionaryHash}
        >
          {children}
        </RootProviders>
      </body>
    </html>
  )
}
