import { Metadata } from "next"
import React from "react"
import "./globals.css"
import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { ThemeSwitch } from "@/components/theme/theme-switch"
import { Toaster } from "@/components/ui/toaster"
import QueryClientProvider from "@/contexts/query-provider"

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Next.js boilerplate",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <NextAuthProvider>
          <QueryClientProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="fixed right-2 top-2 z-10">
                <ThemeSwitch />
              </div>
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryClientProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
