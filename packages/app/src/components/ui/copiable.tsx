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
      className="cursor-pointer rounded-md bg-primary/10 p-1 transition-all hover:bg-primary/20"
      onClick={() => {
        copyToClipboard(text)
      }}
    >
      {text}
    </code>
  )
}
