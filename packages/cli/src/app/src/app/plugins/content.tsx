"use client"

import { ArrowRight, ToyBrick } from "lucide-react"

import ItemCard from "@/components/ui/item-card"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"

export default function PluginsContent({ ssrPlugins }: { ssrPlugins: RouterOutputs["plugins"]["getPlugins"] }) {
  const plugins = trpc.plugins.getPlugins.useQuery(
    {},
    {
      initialData: ssrPlugins,
    }
  )

  return (
    <ul className="relative z-10 flex flex-1 flex-col gap-2 overflow-auto scrollbar-hide">
      {plugins.data.plugins.map((plugin) => (
        <ItemCard
          key={plugin.name}
          id={plugin.name}
          title={plugin.name}
          subTitle={
            <>
              {plugin.sourcePath}
              <ArrowRight className="size-2.5" />
              {plugin.suggestedPath}
            </>
          }
          description={plugin.description}
          endContent={<ToyBrick className="absolute right-2 top-2 size-4 text-primary" />}
        />
      ))}
    </ul>
  )
}
