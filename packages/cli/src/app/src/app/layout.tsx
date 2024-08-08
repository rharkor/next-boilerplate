import React from "react"
import { Metadata } from "next"

import { appDescription, appTitle } from "@/constants"
import { fontSans } from "@/lib/fonts"
import { i18n } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { extractLocale } from "@/lib/utils/server-utils"

import RootProviders from "./providers"

import "./globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, {
    app: { description: true, name: true },
  })
  return {
    title: appTitle(dictionary),
    description: appDescription(dictionary),
  }
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = extractLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "texto-foreground h-dvh min-h-dvh bg-background font-sans antialiased",
          fontSans.variable,
          fontSans.className
        )}
        suppressHydrationWarning
      >
        <RootProviders lang={locale}>{children}</RootProviders>
      </body>
    </html>
  )
}
