import { Metadata } from "next"
import React from "react"
import "../globals.css"
import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import QueryClientProvider from "@/contexts/query-provider"
import TrpcProvider from "@/lib/trpc/provider"
import { i18n } from "i18n-config"

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
            <QueryClientProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
                <Toaster />
              </ThemeProvider>
            </QueryClientProvider>
          </TrpcProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
