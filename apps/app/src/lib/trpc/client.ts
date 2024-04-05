import SuperJSON from "superjson"

import { type AppRouter } from "@/api/_app"
import { createTRPCReact, httpBatchLink, loggerLink } from "@trpc/react-query"

import { getUrl } from "./utils"

export const trpc = createTRPCReact<AppRouter>({})

export const trpcClient = trpc.createClient({
  transformer: SuperJSON,
  links: [
    // adds pretty logs to your console in development and logs errors in production
    loggerLink({
      enabled: (opts) =>
        // eslint-disable-next-line no-process-env
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
