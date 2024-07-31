import { ReactNode } from "react"

import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import TrpcProvider from "@/lib/trpc/provider"

import { RootProvidersDr } from "./providers.dr"
import Toaster from "./toaster"
import UIProvider from "./ui-provider"

export default async function RootProviders({ children, lang }: { children: ReactNode; lang: Locale }) {
  const dictionary = await getDictionary(lang, RootProvidersDr)

  return (
    <UIProvider>
      <NextAuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TrpcProvider dictionary={dictionary}>{children}</TrpcProvider>
          <Toaster />
        </ThemeProvider>
      </NextAuthProvider>
    </UIProvider>
  )
}
