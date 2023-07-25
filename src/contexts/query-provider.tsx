"use client"

import { QueryClient, QueryClientProvider as TQueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return <TQueryClientProvider client={queryClient}>{children}</TQueryClientProvider>
}
