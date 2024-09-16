import { getDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"
import { matchItemFull } from "@next-boilerplate/scripts/utils/template-config/index.js"

import PluginContent from "./content"
import { PluginContentDr } from "./content.dr"

// plugin.store.name + "@" + plugin.store.version + "/" + plugin.name
// Ex:
// - @next-boilerplate/cli-app@latest/turbo/default
// - my-store@1.0.0/my-plugin
const extractPluginFull = (pluginId: string) => {
  const match = pluginId.match(matchItemFull)
  if (!match) {
    throw new Error(`Invalid plugin ID: ${pluginId}`)
  }

  return {
    store: {
      name: match[1],
      version: match[2],
    },
    name: match[3],
  }
}

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
  const pluginFull = extractPluginFull(pluginId)

  const ssrPlugin = await trpc.plugins.getPlugin(pluginFull)
  const ssrConfiguration = await trpc.configuration.getConfiguration()

  return (
    <PluginContent
      pluginFull={pluginFull}
      dictionary={dictionary}
      ssrPlugin={ssrPlugin}
      ssrConfiguration={ssrConfiguration}
    />
  )
}
