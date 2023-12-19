import { cn } from "@/lib/utils"
import { ModalHeader as NModalHeader } from "@nextui-org/react"

export function ModalTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("block text-lg font-semibold", className)}>{children}</h3>
}

export function ModalDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("block text-sm font-light", className)}>{children}</p>
}

export function ModalHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <NModalHeader className={cn("flex-col gap-1", className)}>{children}</NModalHeader>
}
