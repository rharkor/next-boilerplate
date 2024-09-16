import { ReactNode } from "react"

import { ThemeProvider } from "@/components/theme/theme-provider"
import { TDictionary } from "@/lib/langs"
import { TRPCProvider } from "@/lib/trpc/client"

import { RootProvidersDr } from "./providers.dr"
import Toaster from "./toaster"
import UIProvider from "./ui-provider"

export default async function RootProviders({
  children,
  dictionary,
}: {
  children: ReactNode
  dictionary: TDictionary<typeof RootProvidersDr>
}) {
  return (
    <UIProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TRPCProvider dictionary={dictionary}>{children}</TRPCProvider>
        <Toaster />
      </ThemeProvider>
    </UIProvider>
  )
}
