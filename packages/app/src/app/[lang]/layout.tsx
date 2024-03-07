import React from "react"
import { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { i18n, Locale } from "i18n-config"

import { fontSans } from "@/lib/fonts"
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

  const cookiesStore = cookies()
  const hasDictLoaded = cookiesStore.get("i18n-loaded")

  return (
    <html lang={params.lang}>
      <body className={cn("antialiaseds bg-background min-h-screen font-sans", fontSans.variable)}>
        <RootProviders dictionary={hasDictLoaded ? undefined : dictionary} lang={params.lang as Locale}>
          {children}
        </RootProviders>
      </body>
    </html>
  )
}
