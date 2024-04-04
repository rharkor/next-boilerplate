import SuperJSON from "superjson"

import { type AppRouter } from "@/api/_app"
import { createTRPCReact, httpBatchLink, loggerLink } from "@trpc/react-query"

import { env } from "../env"

import { getUrl } from "./utils"

export const trpc = createTRPCReact<AppRouter>({})

export const trpcClient = trpc.createClient({
  transformer: SuperJSON,
  links: [
    // adds pretty logs to your console in development and logs errors in production
    loggerLink({
      enabled: (opts) =>
        (env.ENV === "development" && typeof window !== "undefined") ||
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
