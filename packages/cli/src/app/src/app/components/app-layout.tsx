"use client"

import { AnimatePresence } from "framer-motion"

import NavSettings from "@/components/nav-settings"
import { Locale } from "@/lib/i18n-config"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"

import { AppLayoutDr } from "./app-layout.dr"
import ProjectInit from "./project-init"
import Sidenav from "./sidenav"

export default function AppLayout({
  ssrConfiguration,
  lang,
  dictionary,
  children,
}: {
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  lang: Locale
  dictionary: TDictionary<typeof AppLayoutDr>
  children: React.ReactNode
}) {
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  return (
    <main className="container m-auto flex max-h-screen min-h-screen flex-1 flex-col gap-4 px-3 pt-8">
      <AnimatePresence>
        {!configuration.data.configuration.name && <ProjectInit dictionary={dictionary} />}
      </AnimatePresence>
      <NavSettings lang={lang} ssrConfiguration={ssrConfiguration} dictionary={dictionary} />
      <div className="flex flex-1 flex-row gap-4 pb-8">
        <Sidenav dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
        {children}
      </div>
    </main>
  )
}
