import React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import { appDescription, appTitle } from "@/constants"
import { fontSans } from "@/lib/fonts"
import { i18n, Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { logger } from "@rharkor/logger"

import RootProviders from "./providers"

import "../globals.css"

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  if (!i18n.locales.includes(params.lang)) {
    params.lang = i18n.defaultLocale
  }
  const dictionary = await getDictionary(params.lang as Locale, {
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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  //? If locale is not found, return 404
  if (!i18n.locales.includes(params.lang)) {
    if (params.lang !== "_next") {
      logger.debug(`Locale not found: ${params.lang}`)
    }
    return notFound()
  }

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body
        className={cn(
          "texto-foreground h-dvh min-h-dvh bg-background font-sans antialiased",
          fontSans.variable,
          fontSans.className
        )}
        suppressHydrationWarning
      >
        <RootProviders lang={params.lang as Locale}>{children}</RootProviders>
      </body>
    </html>
  )
}
