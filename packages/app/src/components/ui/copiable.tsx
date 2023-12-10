import { toast } from "react-toastify"

import { TDictionary } from "@/lib/langs"

export default function Copiable({ text, dictionary }: { text: string | undefined; dictionary: TDictionary }) {
  const copyToClipboard = (value?: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    toast(dictionary.copiedToClipboard)
  }

  return (
    <code
      className="bg-primary/10 hover:bg-primary/20 cursor-pointer rounded-md p-1 transition-all"
      onClick={() => {
        copyToClipboard(text)
      }}
    >
      {text}
    </code>
  )
}
