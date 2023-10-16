"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, loggerLink } from "@trpc/client"
import React, { useState } from "react"
import SuperJSON from "superjson"
import { trpc } from "./client"
import { getUrl } from "./utils"

export default function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}))
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: SuperJSON,
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            (process.env.NODE_ENV === "development" && typeof window !== "undefined") ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        // splitLink({
        //   condition(op) {
        //     return op.type === "subscription"
        //   },
        //   true: wsLink({
        //     client: wsClient,
        //   }),
        //   false: httpBatchLink({
        //     url: getUrl(),
        //   }),
        // }),
        httpBatchLink({
          url: getUrl(),
        }),
      ],
    })
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
