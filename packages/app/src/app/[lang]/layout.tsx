import { Metadata } from "next"
import React from "react"
import "../globals.css"
import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { fontSans } from "@/lib/fonts"
import TrpcProvider from "@/lib/trpc/provider"
import { cn } from "@/lib/utils"
import { i18n } from "i18n-config"
import Toaster from "./toaster"
import UIProvider from "./ui-provider"

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
      <body className={cn("antialiaseds min-h-screen bg-background font-sans", fontSans.variable)}>
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
