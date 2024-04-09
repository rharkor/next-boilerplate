import { ReactNode } from "react"

import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { withDictionary } from "@/contexts/dictionary/server-utils"
import { Locale } from "@/lib/i18n-config"
import TrpcProvider from "@/lib/trpc/provider"

import Toaster from "./toaster"
import UIProvider from "./ui-provider"

export default function RootProviders({ children, lang }: { children: ReactNode; lang: Locale }) {
  return withDictionary(
    <UIProvider>
      <NextAuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TrpcProvider>{children}</TrpcProvider>
          <Toaster />
        </ThemeProvider>
      </NextAuthProvider>
    </UIProvider>,
    {
      lang,
    }
  )
}
