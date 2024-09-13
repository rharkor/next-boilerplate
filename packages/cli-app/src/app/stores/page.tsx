import Section from "@/components/ui/section"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import StoresContent from "./content"
import { StoresContentDr } from "./content.dr"

export default async function Stores() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements(StoresContentDr))
  const ssrConfiguration = await serverTrpc.configuration.getConfiguration()

  return (
    <Section>
      <StoresContent ssrConfiguration={ssrConfiguration} dictionary={dictionary} />
    </Section>
  )
}
