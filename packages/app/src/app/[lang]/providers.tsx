import { ReactNode } from "react"

import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import DictionaryProvider from "@/contexts/dictionary/provider"
import { Locale } from "@/lib/i18n-config"
import { TDictionary } from "@/lib/langs"
import TrpcProvider from "@/lib/trpc/provider"

import Toaster from "./toaster"
import UIProvider from "./ui-provider"

export default function RootProviders({
  children,
  dictionary,
  lang,
  dictionaryHash,
}: {
  children: ReactNode
  dictionary: TDictionary | undefined
  lang: Locale
  dictionaryHash: string
}) {
  return (
    <DictionaryProvider dictionary={dictionary} lang={lang} dictionaryHash={dictionaryHash}>
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
