import React from "react"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { i18n } from "i18n-config"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"

import "../globals.css"

export const metadata: Metadata = {
  title: "Next.js Landing Page",
  description: "Welcome to Next.js landing page",
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  //? If locale is not found, return 404
  if (!i18n.locales.includes(params.lang)) return redirect(`/${i18n.defaultLocale}/${params.lang}`)

  return (
    <html lang={params.lang}>
      <body className={cn("antialiaseds bg-background min-h-screen font-sans", fontSans.variable)}>{children}</body>
    </html>
  )
}
