import { ModalHeader as NModalHeader } from "@nextui-org/react"

export function ModalTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="block text-lg font-semibold">{children}</h3>
}

export function ModalDescription({ children }: { children: React.ReactNode }) {
  return <p className="block text-sm font-light">{children}</p>
}

export function ModalHeader({ children }: { children: React.ReactNode }) {
  return <NModalHeader className="flex-col gap-1">{children}</NModalHeader>
}
