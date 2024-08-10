"use client"

import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"

import { PluginsContentDr } from "./content.dr"
import Plugin from "./plugin"

type TPlugins = RouterOutputs["plugins"]["getPlugins"]

export default function PluginsContent({
  ssrPlugins,
  ssrConfiguration,
  dictionary,
}: {
  ssrPlugins: TPlugins
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  dictionary: TDictionary<typeof PluginsContentDr>
}) {
  const plugins = trpc.plugins.getPlugins.useQuery(
    {},
    {
      initialData: ssrPlugins,
    }
  )

  return (
    <ul className="flex flex-1 flex-col gap-2 overflow-auto scrollbar-hide">
      {plugins.data.plugins.map((plugin) => (
        <Plugin key={plugin.id} plugin={plugin} dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
      ))}
    </ul>
  )
}
