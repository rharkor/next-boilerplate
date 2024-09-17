import { getDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"
import { extractItemUID } from "@next-boilerplate/cli-helpers/stores"

import TemplateContent from "./content"
import { TemplateContentDr } from "./content.dr"

export default async function Template({
  params,
}: {
  params: {
    id: string
  }
}) {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements({}, TemplateContentDr))

  const templateId = decodeURIComponent(params.id)
  const templateFull = extractItemUID(templateId)
  const ssrTemplate = await trpc.templates.getTemplate(templateFull)
  const ssrConfiguration = await trpc.configuration.getConfiguration()

  return (
    <TemplateContent
      templateFull={templateFull}
      dictionary={dictionary}
      ssrTemplate={ssrTemplate}
      ssrConfiguration={ssrConfiguration}
    />
  )
}
