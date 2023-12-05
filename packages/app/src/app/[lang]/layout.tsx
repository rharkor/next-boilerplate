import React from "react"
import { Metadata } from "next"
import { i18n } from "i18n-config"

import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { fontSans } from "@/lib/fonts"
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

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  return (
    <html lang={params.lang}>
      <body className={cn("antialiaseds bg-background min-h-screen font-sans", fontSans.variable)}>
        <UIProvider>
          <NextAuthProvider>
            <TrpcProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
                <Toaster />
              </ThemeProvider>
            </TrpcProvider>
          </NextAuthProvider>
        </UIProvider>
      </body>
    </html>
  )
}
