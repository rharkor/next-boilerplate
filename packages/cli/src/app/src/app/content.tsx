"use client"

import { AnimatePresence } from "framer-motion"

import NavSettings from "@/components/nav-settings"
import { Locale } from "@/lib/i18n-config"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"

import CurrentConfiguration from "./components/current-configuration"
import ProjectInit from "./components/project-init"
import Sidenav from "./components/sidenav"
import { MainContentDr } from "./content.dr"

export default function MainContent({
  dictionary,
  ssrConfiguration,
  lang,
}: {
  dictionary: TDictionary<typeof MainContentDr>
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  lang: Locale
}) {
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  return (
    <>
      <AnimatePresence>
        {!configuration.data.configuration.name && <ProjectInit dictionary={dictionary} />}
      </AnimatePresence>
      <NavSettings lang={lang} ssrConfiguration={ssrConfiguration} />
      <div className="flex w-full flex-1 flex-row gap-4">
        <Sidenav dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
        <CurrentConfiguration dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
      </div>
    </>
  )
}
