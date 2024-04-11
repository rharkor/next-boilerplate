import React from "react"
import { Metadata } from "next"
import { redirect } from "next/navigation"

import { fontSans } from "@/lib/fonts"
import { i18n, Locale } from "@/lib/i18n-config"
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

  return (
    <html lang={params.lang}>
      <body className={cn("antialiaseds min-h-screen bg-background font-sans", fontSans.variable)}>
        <RootProviders lang={params.lang as Locale}>{children}</RootProviders>
      </body>
    </html>
  )
}
