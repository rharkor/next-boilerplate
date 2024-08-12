import React from "react"
import { Metadata } from "next"

import { ThemeProvider } from "@/components/theme/theme-provider"
import { fontSans } from "@/lib/fonts"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { extractLocale } from "@/lib/utils/server-utils"
import { Button } from "@nextui-org/button"
import { Link } from "@nextui-org/link"

import UIProvider from "./ui-provider"

export async function generateMetadata(): Promise<Metadata> {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, {
    notFound: true,
  })
  return {
    title: dictionary.notFound,
  }
}

export default async function Page404MatchAll() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, {
    notFound: true,
    goHome: true,
  })
  return (
    <html lang={locale}>
      <body
        className={cn("h-dvh min-h-dvh bg-background font-sans antialiased", fontSans.variable, fontSans.className)}
      >
        <UIProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
              <h1 className="text-4xl font-bold">{dictionary.notFound}</h1>
              <Button as={Link} href="/" color="primary" variant="flat">
                {dictionary.goHome}
              </Button>
            </main>
          </ThemeProvider>
        </UIProvider>
      </body>
    </html>
  )
}
