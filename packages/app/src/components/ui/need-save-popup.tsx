import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/react"

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
    <div
      className={cn("fixed bottom-0 left-1 right-1 z-50 mx-0 overflow-hidden pb-4 lg:left-2 lg:right-2", {
        "pointer-events-none invisible": !show,
      })}
    >
      <div
        className={cn(
          "border-foreground/10 bg-muted m-auto flex w-max translate-y-full flex-col items-center justify-center space-y-2 rounded-3xl border px-4 py-2 opacity-0 shadow-2xl transition-all duration-300 lg:flex-row lg:space-x-4 lg:space-y-0",
          {
            "translate-y-0 animate-[bounce-up_1s_ease-out] opacity-100": show,
          }
        )}
      >
        <p className="text-foreground text-sm">{text}</p>
        <div className="flex flex-row gap-2">
          <Button onPress={onReset} className="text-primary !bg-transparent px-2" color="primary" type="button">
            {dictionary.reset}
          </Button>
          <Button onPress={onSave} isLoading={isSubmitting} color="primary" type="submit">
            {dictionary.saveChanges}
          </Button>
        </div>
      </div>
    </div>
  )
}
