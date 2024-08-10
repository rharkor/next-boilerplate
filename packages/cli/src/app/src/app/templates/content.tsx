"use client"

import { BookDashed } from "lucide-react"

import ItemCard from "@/components/ui/item-card"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"

export default function TemplatesContent({
  ssrTemplates,
}: {
  ssrTemplates: RouterOutputs["templates"]["getTemplates"]
}) {
  const templates = trpc.templates.getTemplates.useQuery(
    {},
    {
      initialData: ssrTemplates,
    }
  )

  return (
    <ul className="flex flex-1 flex-col gap-2 overflow-auto scrollbar-hide">
      {templates.data.templates.map((template) => (
        <ItemCard
          key={template.id}
          id={template.id}
          title={template.name}
          subTitle={template.sourcePath}
          description={template.description}
          endContent={<BookDashed className="absolute right-2 top-2 size-4 text-primary" />}
          href={`/templates/${template.id}`}
        />
      ))}
    </ul>
  )
}
