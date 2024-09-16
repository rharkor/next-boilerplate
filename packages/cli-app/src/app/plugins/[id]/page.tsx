import { getDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import PluginContent from "./content"
import { PluginContentDr } from "./content.dr"

export default async function Plugin({
  params,
}: {
  params: {
    id: string
  }
}) {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements({}, PluginContentDr))

  const pluginId = decodeURIComponent(params.id)
  const ssrPlugin = await trpc.plugins.getPlugin({ id: pluginId })
  const ssrConfiguration = await trpc.configuration.getConfiguration()

  return (
    <PluginContent id={pluginId} dictionary={dictionary} ssrPlugin={ssrPlugin} ssrConfiguration={ssrConfiguration} />
  )
}
