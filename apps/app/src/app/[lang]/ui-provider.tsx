"use client"

import { useRouter } from "next/navigation"

import { NextUIProvider } from "@nextui-org/react"

export default function UIProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <NextUIProvider navigate={router.push} className="flex min-h-full flex-col">
      {children}
    </NextUIProvider>
  )
}
