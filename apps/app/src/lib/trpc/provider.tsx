"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"

import { AppRouter } from "@/api/_app"
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TRPCClientErrorLike } from "@trpc/client"

import { TDictionary } from "../langs"
import { handleMutationError, handleQueryError } from "../utils/client-utils"

import { trpc, trpcClient } from "./client"
import { TrpcProviderDr } from "./provider.dr"

const testNoDefaultErrorHandling = (query: unknown) =>
  typeof query === "object" &&
  query &&
  "meta" in query &&
  typeof query.meta === "object" &&
  query.meta &&
  "noDefaultErrorHandling" in query.meta &&
  query.meta.noDefaultErrorHandling

export default function TrpcProvider({
  children,
  dictionary,
}: {
  children: React.ReactNode
  dictionary: TDictionary<typeof TrpcProviderDr>
}) {
  const router = useRouter()

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

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
