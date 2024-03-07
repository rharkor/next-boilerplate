import { ReactNode } from "react"
import { Locale } from "i18n-config"

import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import DictionaryProvider from "@/contexts/dictionary/provider"
import { TDictionary } from "@/lib/langs"
import TrpcProvider from "@/lib/trpc/provider"

import Toaster from "./toaster"
import UIProvider from "./ui-provider"

export default function RootProviders({
  children,
  dictionary,
  lang,
}: {
  children: ReactNode
  dictionary: TDictionary | undefined
  lang: Locale
}) {
  return (
    <DictionaryProvider dictionary={dictionary} lang={lang}>
      <UIProvider>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TrpcProvider>{children}</TrpcProvider>
            <Toaster />
          </ThemeProvider>
        </NextAuthProvider>
      </UIProvider>
    </DictionaryProvider>
  )
}
