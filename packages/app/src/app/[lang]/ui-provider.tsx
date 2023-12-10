"use client"

import { useRouter } from "next/navigation"

import { NextUIProvider } from "@nextui-org/react"

export default function UIProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return <NextUIProvider navigate={router.push}>{children}</NextUIProvider>
}
