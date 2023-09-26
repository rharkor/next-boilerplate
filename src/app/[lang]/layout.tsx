import { Metadata } from "next"
import React from "react"
import "../globals.css"
import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import TrpcProvider from "@/lib/trpc/provider"
import { i18n } from "i18n-config"
import Toaster from "./toaster"

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
      <body className="flex min-h-screen flex-col">
        <NextAuthProvider>
          <TrpcProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <Toaster />
            </ThemeProvider>
          </TrpcProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
