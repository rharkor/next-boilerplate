import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

export type INeedSavePopupProps = {
  show: boolean
  onReset?: () => void
  onSave?: () => void
  text: string
  isSubmitting?: boolean
  dictionary: {
    reset: string
    saveChanges: string
  }
}

export default function NeedSavePopup({ show, onReset, onSave, text, isSubmitting, dictionary }: INeedSavePopupProps) {
  return (
    <div className={"fixed bottom-0 z-50 mx-0 overflow-hidden pb-4"}>
      <div
        className={cn(
          "flex w-max translate-y-full flex-row items-center justify-center space-x-4 rounded border border-card-foreground/40 bg-card px-4 py-2 opacity-0 transition-all duration-300",
          {
            "translate-y-0 animate-[bounce-up_1s_ease-out] opacity-100": show,
          }
        )}
      >
        <p className="text-sm text-gray-500">{text}</p>
        <div className="flex flex-row gap-2">
          <Button variant="link" onClick={onReset} className="px-2" type="button">
            {dictionary.reset}
          </Button>
          <Button onClick={onSave} isLoading={isSubmitting}>
            {dictionary.saveChanges}
          </Button>
        </div>
      </div>
    </div>
  )
}
