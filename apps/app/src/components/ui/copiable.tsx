"use client"

import { useRef, useState } from "react"
import { ClipboardList } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Button, Tooltip } from "@nextui-org/react"

import { CopiableDr } from "./copiable.dr"

export default function Copiable({
  text,
  isDisabled,
  className,
  classNames,
  dictionary,
}: {
  text: string | undefined
  isDisabled?: boolean
  className?: string
  classNames?: {
    text?: string
    button?: string
    icon?: string
  }
  dictionary: TDictionary<typeof CopiableDr>
}) {
  const [isCopied, setIsCopied] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const copyToClipboard = (value?: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setIsCopied(true)
    setIsTooltipOpen(true)
  }

  if (isTooltipOpen === false && isCopied) {
    setIsCopied(false)
  }

  const textRef = useRef(null)
  const selectText = () => {
    if (textRef.current) {
      const range = document.createRange()
      range.selectNode(textRef.current)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }
  }

  return (
    <div className="copiable group flex flex-row items-center gap-1">
      <p
        className={cn(
          "block cursor-pointer rounded-small border border-foreground-300/20 bg-foreground-200/20 p-[3px] px-2 text-xs",
          {
            "pointer-events-none text-muted-foreground": isDisabled,
          },
          className,
          classNames?.text
        )}
        ref={textRef}
        onClick={selectText}
      >
        {text}
      </p>
      <Tooltip
        isOpen={isTooltipOpen}
        onOpenChange={(open) => setIsTooltipOpen(open)}
        content={isCopied ? dictionary.copiedToClipboard : dictionary.copyToClipboard}
        isDisabled={isDisabled}
      >
        <Button
          className={cn(
            "block h-max min-h-[24px] min-w-0 cursor-pointer rounded-small border border-foreground-300/20 bg-[unset] p-1 px-3",
            "focus:border-primary focus:bg-foreground-200/20 focus:!outline-0",
            classNames?.button
          )}
          isDisabled={isDisabled}
          onPress={() => {
            copyToClipboard(text)
          }}
        >
          <ClipboardList className={cn("size-3.5", classNames?.icon)} />
        </Button>
      </Tooltip>
    </div>
  )
}
