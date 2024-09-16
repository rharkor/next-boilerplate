import { getDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"
import { matchItemFull } from "@next-boilerplate/scripts/utils/template-config/index.js"

import TemplateContent from "./content"
import { TemplateContentDr } from "./content.dr"

// plugin.store.name + "@" + plugin.store.version + "/" + plugin.name
// Ex:
// - @next-boilerplate/cli-app@latest/empty-monorepo
// - my-store@1.0.0/my-template
const extractTemplateFull = (templateId: string) => {
  const match = templateId.match(matchItemFull)
  if (!match) {
    throw new Error(`Invalid template ID: ${templateId}`)
  }

  return {
    store: {
      name: match[1],
      version: match[2],
    },
    name: match[3],
  }
}

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
  const templateFull = extractTemplateFull(templateId)
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
