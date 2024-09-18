"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import { BookDashed, ChevronRight } from "lucide-react"

import ChooseStore from "@/components/choose-store"
import Header from "@/components/ui/header"
import ItemCard from "@/components/ui/item-card"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { getItemUID } from "@next-boilerplate/cli-helpers/stores"
import { Input } from "@nextui-org/input"
import { Link } from "@nextui-org/link"
import { Spinner } from "@nextui-org/spinner"

import { TemplatesContentDr } from "./content.dr"

export default function TemplatesContent({
  initialStoreName,
  initialStoreVersion,
  ssrStores,
  ssrTemplates,
  dictionary,
}: {
  initialStoreName: string | null
  initialStoreVersion: string | null
  ssrStores: RouterOutputs["stores"]["getStores"]
  ssrTemplates: RouterOutputs["templates"]["getTemplates"] | undefined
  dictionary: TDictionary<typeof TemplatesContentDr>
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

  const templates = trpc.templates.getTemplates.useQuery(
    {
      search: _search,
      store: {
        name: storeName ?? "",
        version: storeVersion ?? "",
      },
    },
    {
      initialData: isInitialFilter ? ssrTemplates : undefined,
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
        lnk="/templates"
      />
    )
  }

  return (
    <>
      <Header
        title={
          <>
            {dictionary.templates}
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Link href={"/templates"} className="text-xs">
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
              templates.isLoading && (
                <Spinner
                  classNames={{
                    wrapper: "!size-4",
                  }}
                  color="current"
                  size="sm"
                />
              )
            }
            isDisabled={templates.isLoading}
          />
        }
      />
      <ul className="flex flex-1 flex-col gap-2">
        {templates.data?.templates.map((template) => (
          <ItemCard
            key={getItemUID(template)}
            id={getItemUID(template)}
            title={template.name}
            subTitle={template.sourcePath}
            description={template.description}
            endContent={<BookDashed className="absolute right-2 top-2 size-4 text-primary" />}
            href={`/templates/${encodeURIComponent(getItemUID(template))}`}
          />
        ))}
      </ul>
    </>
  )
}
