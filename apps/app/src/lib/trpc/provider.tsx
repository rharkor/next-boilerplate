"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import SuperJSON from "superjson"

import { AppRouter } from "@/api/_app"
import { useDictionary } from "@/contexts/dictionary/utils"
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, loggerLink, TRPCClientErrorLike } from "@trpc/client"

import { handleMutationError, handleQueryError } from "../utils/client-utils"

import { trpc } from "./client"
import { getUrl } from "./utils"

const testNoDefaultErrorHandling = (query: unknown) =>
  typeof query === "object" &&
  query &&
  "meta" in query &&
  typeof query.meta === "object" &&
  query.meta &&
  "noDefaultErrorHandling" in query.meta &&
  query.meta.noDefaultErrorHandling

export default function TrpcProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dictionary = useDictionary()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (testNoDefaultErrorHandling(query)) return
            handleQueryError(error as TRPCClientErrorLike<AppRouter>, dictionary, router)
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _v, _c, mutation) => {
            if (testNoDefaultErrorHandling(mutation)) return
            handleMutationError(error as TRPCClientErrorLike<AppRouter>, dictionary, router)
          },
        }),
      })
  )

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
