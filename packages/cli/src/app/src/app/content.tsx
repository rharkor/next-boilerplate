"use client"

import { TDictionary } from "@/lib/langs"
import { RouterOutputs } from "@/lib/trpc/utils"

import CurrentConfiguration from "./components/current-configuration"
import { MainContentDr } from "./content.dr"

export default function MainContent({
  dictionary,
  ssrConfiguration,
}: {
  dictionary: TDictionary<typeof MainContentDr>
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
}) {
  return <CurrentConfiguration dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
}
