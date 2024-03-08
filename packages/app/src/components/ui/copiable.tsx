"use client"

import { useRef, useState } from "react"
import { ClipboardList } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { Button, Tooltip } from "@nextui-org/react"

export default function Copiable({ text, dictionary }: { text: string | undefined; dictionary: TDictionary }) {
  const [isCopied, setIsCopied] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const copyToClipboard = (value?: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    // toast(dictionary.copiedToClipboard)
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
        className="bg-foreground-200/20 rounded-small border-foreground-300/20 block cursor-pointer border p-[3px] px-2 text-xs"
        ref={textRef}
        onClick={selectText}
      >
        {text}
      </p>
      <Tooltip
        isOpen={isTooltipOpen}
        onOpenChange={(open) => setIsTooltipOpen(open)}
        content={isCopied ? dictionary.copiedToClipboard : dictionary.copyToClipboard}
      >
        <Button
          className="rounded-small border-foreground-300/20 block h-max min-h-[24px] min-w-0 cursor-pointer border bg-[unset] p-1 px-3"
          onPress={() => {
            copyToClipboard(text)
          }}
        >
          <ClipboardList className="size-3.5" />
        </Button>
      </Tooltip>
    </div>
  )
}
