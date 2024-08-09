"use client"

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
    <ul className="relative z-10 flex min-h-full flex-col gap-2 overflow-auto scrollbar-hide">
      {templates.data.templates.map((template) => (
        <ItemCard
          key={template.name}
          id={template.name}
          title={template.name}
          subTitle={template.sourcePath}
          description={template.description}
        />
      ))}
    </ul>
  )
}
