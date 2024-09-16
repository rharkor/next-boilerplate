"use client" // <-- to make sure we can mount the Provider from a server component

import { useState } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { useRouter } from "next/navigation"

import superjson from "superjson"

import type { AppRouter } from "@/api/_app"
import type { QueryClient } from "@tanstack/react-query"
import { QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"

import { env } from "../env"
import { TDictionary } from "../langs"

import { TRPCProviderDr } from "./client.dr"
import { makeQueryClient } from "./query-client"

export const trpc = createTRPCReact<AppRouter>()

let clientQueryClientSingleton: QueryClient
function getQueryClient({
  dictionary,
  router,
}: {
  dictionary: TDictionary<typeof TRPCProviderDr>
  router: AppRouterInstance
}) {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient({ dictionary, router })()
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient({ dictionary, router })())
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return ""
    // eslint-disable-next-line no-process-env
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return env.BASE_URL
  })()
  return `${base}/api/trpc`
}

export function TRPCProvider({
  children,
  dictionary,
}: Readonly<{
  children: React.ReactNode
  dictionary: TDictionary<typeof TRPCProviderDr>
}>) {
  const router = useRouter()

  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient({
    dictionary,
    router,
  })

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            // eslint-disable-next-line no-process-env
            (process.env.NODE_ENV === "development" && typeof window !== "undefined") ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          transformer: superjson,
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
