"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { ChevronRight } from "lucide-react"

import ChooseStore from "@/components/choose-store"
import Header from "@/components/ui/header"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { cn } from "@/lib/utils"
import { getItemUID } from "@next-boilerplate/cli-helpers/stores"
import { Input } from "@nextui-org/input"
import { Link } from "@nextui-org/link"
import { Spinner } from "@nextui-org/spinner"

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

  const storeName = useMemo(() => {
    const storeName = sp.get("storeName")
    return storeName ? decodeURIComponent(storeName) : null
  }, [sp])
  const storeVersion = useMemo(() => {
    const storeVersion = sp.get("storeVersion")
    return storeVersion ? decodeURIComponent(storeVersion) : null
  }, [sp])

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

  // Do not set empty data to the cache
  const [pluginsData, setPluginsData] = useState<TPlugins>(
    ssrPlugins ?? {
      plugins: [],
    }
  )
  useEffect(() => {
    if (plugins.data) {
      setPluginsData(plugins.data)
    }
  }, [plugins.data])

  const stores = trpc.stores.getStores.useQuery(
    { onlyInstalled: true, search: _search },
    {
      initialData: isInitialFilter ? ssrStores : undefined,
    }
  )

  const [storesData, setStoresData] = useState(ssrStores)
  useEffect(() => {
    if (stores.data) {
      setStoresData(stores.data)
    }
  }, [stores.data])

  if (!storeName || !storeVersion) {
    return (
      <ChooseStore
        dictionary={dictionary}
        stores={storesData}
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
        actions={
          <Input
            value={search}
            onValueChange={setSearch}
            placeholder={dictionary.search}
            endContent={
              plugins.isLoading && (
                <Spinner
                  classNames={{
                    wrapper: "!size-4",
                  }}
                  color="current"
                  size="sm"
                />
              )
            }
            className={cn("w-64", {
              "opacity-50": plugins.isLoading,
            })}
            isReadOnly={plugins.isLoading}
          />
        }
      />
      <ul className="flex flex-1 flex-col gap-2">
        {pluginsData.plugins.map((plugin) => (
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
