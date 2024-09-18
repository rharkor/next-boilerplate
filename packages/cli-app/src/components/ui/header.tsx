"use client"

import React from "react"
import { useRouter } from "next/navigation"

import { ChevronLeft } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { Button } from "@nextui-org/button"
import { Tooltip } from "@nextui-org/tooltip"

import { HeaderDr } from "./header.dr"

export default function Header({
  title,
  actions,
  withBack,
  dictionary,
}: {
  title: string | React.ReactNode
  actions?: React.ReactNode
  withBack?: boolean
  dictionary: TDictionary<typeof HeaderDr>
}) {
  const router = useRouter()

  const content = (
    <div className="flex items-center justify-between gap-3">
      <h1 className="flex flex-col gap-1 text-3xl">{title}</h1>
      <div className="flex flex-row gap-2">{actions}</div>
    </div>
  )

  if (withBack) {
    return (
      <div className="space-y-2">
        {withBack && (
          <Tooltip content={dictionary.back} delay={500}>
            <Button
              size="sm"
              onPress={() => {
                router.back()
              }}
              className="h-max min-w-0 p-2"
              variant="faded"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </Tooltip>
        )}
        {content}
      </div>
    )
  }

  return content
}
