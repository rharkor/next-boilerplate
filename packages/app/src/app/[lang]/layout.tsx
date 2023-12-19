import React from "react"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { i18n, Locale } from "i18n-config"

import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { fontSans } from "@/lib/fonts"
import { getDictionary } from "@/lib/langs"
import TrpcProvider from "@/lib/trpc/provider"
import { cn } from "@/lib/utils"

import Toaster from "./toaster"
import UIProvider from "./ui-provider"

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

  return (
    <html lang={params.lang}>
      <body className={cn("antialiaseds bg-background min-h-screen font-sans", fontSans.variable)}>
        <UIProvider>
          <NextAuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TrpcProvider dictionary={dictionary}>{children}</TrpcProvider>
              <Toaster />
            </ThemeProvider>
          </NextAuthProvider>
        </UIProvider>
      </body>
    </html>
  )
}
