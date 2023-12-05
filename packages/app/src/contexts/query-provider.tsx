"use client"

import { useState } from "react"

import { QueryClient, QueryClientProvider as TQueryClientProvider } from "@tanstack/react-query"

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return <TQueryClientProvider client={queryClient}>{children}</TQueryClientProvider>
}
