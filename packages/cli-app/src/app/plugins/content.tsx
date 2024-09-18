"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { ChevronRight } from "lucide-react"

import ChooseStore from "@/components/choose-store"
import Header from "@/components/ui/header"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { getItemUID } from "@next-boilerplate/cli-helpers/stores"
import { Input } from "@nextui-org/input"
import { Link } from "@nextui-org/link"

import { PluginsContentDr } from "./content.dr"
import Plugin from "./plugin"

type TPlugins = RouterOutputs["plugins"]["getPlugins"]

export default function PluginsContent({
  ssrPlugins,
  ssrStores,
  initialStoreName,
  initialStoreVersion,
  ssrConfiguration,
  dictionary,
}: {
  ssrPlugins: TPlugins | undefined
  ssrStores: RouterOutputs["stores"]["getStores"]
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
  initialStoreName: string | null
  initialStoreVersion: string | null
  dictionary: TDictionary<typeof PluginsContentDr>
}) {
  const [_search, _setSearch] = useState("")
  const [search, setSearch] = useState(_search)

  const sp = useSearchParams()

  const storeName = useMemo(() => sp.get("storeName"), [sp])
  const storeVersion = useMemo(() => sp.get("storeVersion"), [sp])

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      _setSearch(search)
    }, 250)
    return () => clearTimeout(timeout)
  }, [search])

  const isInitialFilter = search === "" && storeName === initialStoreName && storeVersion === initialStoreVersion

  const plugins = trpc.plugins.getPlugins.useQuery(
    {
      search: _search,
      store: {
        name: storeName ?? "",
        version: storeVersion ?? "",
      },
    },
    {
      initialData: isInitialFilter ? ssrPlugins : undefined,
      enabled: storeName && storeVersion ? true : false,
    }
  )

  const stores = trpc.stores.getStores.useQuery(undefined, {
    initialData: ssrStores,
  })

  if (!storeName || !storeVersion) {
    return (
      <ChooseStore
        dictionary={dictionary}
        stores={stores.data}
        isLoading={stores.isLoading}
        search={search}
        setSearch={setSearch}
        lnk="/plugins"
      />
    )
  }

  return (
    <>
      <Header
        title={
          <>
            {dictionary.plugins}
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Link href={"/plugins"} className="text-xs">
                {dictionary.stores}
              </Link>
              <ChevronRight className="size-4" />
              {storeName}
            </span>
          </>
        }
        dictionary={dictionary}
        actions={<Input value={search} onValueChange={setSearch} placeholder={dictionary.search} />}
      />
      <ul className="flex flex-1 flex-col gap-2">
        {plugins.isLoading
          ? [...Array(5)].map((_, i) => (
              <Plugin
                key={i}
                plugin={{
                  name: "",
                  store: {
                    name: "",
                    version: "",
                  },
                  description: "",
                  sourcePath: "",
                  paths: [],
                }}
                dictionary={dictionary}
                ssrConfiguration={ssrConfiguration}
                isLoading
              />
            ))
          : plugins.data?.plugins.map((plugin) => (
              <Plugin
                key={getItemUID(plugin)}
                plugin={plugin}
                dictionary={dictionary}
                ssrConfiguration={ssrConfiguration}
              />
            ))}
      </ul>
    </>
  )
}
