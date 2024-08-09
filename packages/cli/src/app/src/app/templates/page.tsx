import Header from "@/components/ui/header"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import TemplatesContent from "./content"
import { TemplatesContentDr } from "./content.dr"

export default async function Templates() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements({ templates: true }, TemplatesContentDr))
  const ssrTemplates = await serverTrpc.templates.getTemplates({})

  return (
    <section className="flex w-full flex-col gap-5">
      <Header title={dictionary.templates} />
      <TemplatesContent ssrTemplates={ssrTemplates} />
    </section>
  )
}
