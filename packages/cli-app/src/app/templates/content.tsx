"use client"

import { useEffect, useState } from "react"

import { BookDashed } from "lucide-react"

import Header from "@/components/ui/header"
import ItemCard from "@/components/ui/item-card"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Input } from "@nextui-org/input"

import { TemplatesContentDr } from "./content.dr"

export default function TemplatesContent({
  ssrTemplates,
  dictionary,
}: {
  ssrTemplates: RouterOutputs["templates"]["getTemplates"]
  dictionary: TDictionary<typeof TemplatesContentDr>
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

  const templates = trpc.templates.getTemplates.useQuery(
    {
      search: _search,
    },
    {
      initialData: isInitialFilter ? ssrTemplates : undefined,
    }
  )

  return (
    <>
      <Header
        title={dictionary.templates}
        dictionary={dictionary}
        actions={<Input value={search} onValueChange={setSearch} placeholder={dictionary.search} />}
      />
      <ul className="flex flex-1 flex-col gap-2">
        {templates.isLoading
          ? [...Array(5)].map((_, i) => <ItemCard key={i} description="" id="" title="" isLoading />)
          : templates.data?.templates.map((template) => (
              <ItemCard
                key={template.store.name + "@" + template.store.version + "/" + template.name}
                id={template.store.name + "@" + template.store.version + "/" + template.name}
                title={template.name}
                subTitle={template.sourcePath}
                description={template.description}
                endContent={<BookDashed className="absolute right-2 top-2 size-4 text-primary" />}
                href={`/templates/${encodeURIComponent(template.store.name + "@" + template.store.version + "/" + template.name)}`}
              />
            ))}
      </ul>
    </>
  )
}
