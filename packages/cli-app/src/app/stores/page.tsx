import Section from "@/components/ui/section"
import { getDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import StoresContent from "./content"
import { StoresContentDr } from "./content.dr"

export default async function Stores() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements(StoresContentDr))
  const ssrConfiguration = await trpc.configuration.getConfiguration()
  const ssrStores = await trpc.stores.getStores()

  return (
    <Section>
      <StoresContent ssrConfiguration={ssrConfiguration} ssrStores={ssrStores} dictionary={dictionary} />
    </Section>
  )
}
