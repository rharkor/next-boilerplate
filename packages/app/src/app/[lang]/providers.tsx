import { ReactNode } from "react"

import { NextAuthProvider } from "@/components/auth/provider"
import { ThemeProvider } from "@/components/theme/theme-provider"
import DictionaryProvider from "@/contexts/dictionary/provider"
import { TDictionary } from "@/lib/langs"
import TrpcProvider from "@/lib/trpc/provider"

import Toaster from "./toaster"
import UIProvider from "./ui-provider"

export default function RootProviders({ children, dictionary }: { children: ReactNode; dictionary: TDictionary }) {
  return (
    <DictionaryProvider dictionary={dictionary}>
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
