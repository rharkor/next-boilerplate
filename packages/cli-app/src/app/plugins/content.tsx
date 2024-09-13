"use client"

import { useEffect, useState } from "react"

import Header from "@/components/ui/header"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Input } from "@nextui-org/input"

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
  const [_search, _setSearch] = useState("")
  const [search, setSearch] = useState(_search)

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      _setSearch(search)
    }, 250)
    return () => clearTimeout(timeout)
  }, [search])

  const isInitialFilter = search === ""

  const plugins = trpc.plugins.getPlugins.useQuery(
    {
      search: _search,
    },
    {
      initialData: isInitialFilter ? ssrPlugins : undefined,
    }
  )

  return (
    <>
      <Header
        title={dictionary.plugins}
        dictionary={dictionary}
        actions={<Input value={search} onValueChange={setSearch} placeholder={dictionary.search} />}
      />
      <ul className="flex flex-1 flex-col gap-2">
        {plugins.isLoading
          ? [...Array(5)].map((_, i) => (
              <Plugin
                key={i}
                plugin={{ id: "", name: "", description: "", sourcePath: "", paths: [] }}
                dictionary={dictionary}
                ssrConfiguration={ssrConfiguration}
                isLoading
              />
            ))
          : plugins.data?.plugins.map((plugin) => (
              <Plugin key={plugin.id} plugin={plugin} dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
            ))}
      </ul>
    </>
  )
}
