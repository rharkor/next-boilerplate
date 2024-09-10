import Header from "@/components/ui/header"
import { HeaderDr } from "@/components/ui/header.dr"
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
    dictionaryRequirements({ templates: true }, TemplatesContentDr, HeaderDr)
  )
  const ssrTemplates = await serverTrpc.templates.getTemplates({})

  return (
    <Section>
      <Header title={dictionary.templates} dictionary={dictionary} />
      <TemplatesContent ssrTemplates={ssrTemplates} />
    </Section>
  )
}
