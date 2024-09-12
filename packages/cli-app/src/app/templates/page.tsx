import Section from "@/components/ui/section"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import TemplatesContent from "./content"
import { TemplatesContentDr } from "./content.dr"

export default async function Templates() {
  const locale = extractLocale()
  const dictionary = await getDictionary(
    locale,
    dictionaryRequirements(TemplatesContentDr)
  )
  const ssrTemplates = await serverTrpc.templates.getTemplates({})

  return (
    <Section>
      <TemplatesContent ssrTemplates={ssrTemplates} dictionary={dictionary} />
    </Section>
  )
}
