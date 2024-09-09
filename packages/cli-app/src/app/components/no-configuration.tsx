import React from "react"
import Link from "next/link"

import { BookDashed, ToyBrick } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { Chip } from "@nextui-org/chip"

import { NoConfigurationDr } from "./no-configuration.dr"

export default function NoConfiguration({ dictionary }: { dictionary: TDictionary<typeof NoConfigurationDr> }) {
  return (
    <section className="flex w-full flex-col items-center gap-5 overflow-hidden">
      <h1 className="text-3xl">{dictionary.createYourConfiguration}</h1>
      <div className="flex flex-1 flex-wrap gap-2">
        <ConfigurationCard
          name={dictionary.fromTemplate}
          description={dictionary.fromTemplateDescription}
          icon={<BookDashed className="size-16 xl:size-20 2xl:size-24" />}
          kind="suggested"
          dictionary={dictionary}
          href="/templates"
        />
        <ConfigurationCard
          name={dictionary.fromScratch}
          description={dictionary.fromScratchDescription}
          icon={<ToyBrick className="size-16 xl:size-20 2xl:size-24" />}
          kind="advanced"
          dictionary={dictionary}
          href="/plugins"
        />
      </div>
    </section>
  )
}

function ConfigurationCard({
  description,
  icon,
  name,
  kind,
  dictionary,
  href,
}: {
  name: string
  description: string
  icon: React.ReactNode
  kind: "suggested" | "advanced"
  dictionary: TDictionary<typeof NoConfigurationDr>
  href: string
}) {
  return (
    <Link href={href} className="h-max flex-1">
      <button className="group relative flex h-[400px] min-w-[300px] flex-col items-center justify-center gap-2 rounded-medium border border-transparent bg-content2 p-3 shadow hover:border-primary hover:bg-content2/80">
        <span className="text-foreground group-hover:text-primary">{icon}</span>
        <h2 className="text-center text-2xl font-semibold">{name}</h2>
        <p className="text-center text-base text-muted-foreground">{description}</p>
        <Chip
          color={kind === "suggested" ? "primary" : "default"}
          className="absolute left-2 top-2"
          variant={kind === "suggested" ? "dot" : "flat"}
        >
          {kind === "suggested" ? dictionary.suggested : dictionary.advanced}
        </Chip>
      </button>
    </Link>
  )
}
