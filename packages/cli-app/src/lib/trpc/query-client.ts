import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

import { toast } from "react-toastify"
import superjson from "superjson"

import { AppRouter } from "@/api/_app"
import { logger } from "@rharkor/logger"
import {
  defaultShouldDehydrateQuery,
  Mutation,
  MutationCache,
  Query,
  QueryCache,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query"
import { TRPCClientError, TRPCClientErrorLike } from "@trpc/client"

import { TDictionary } from "../langs"
import { handleMutationError, handleQueryError } from "../utils/client-utils"
import { dictionaryRequirements } from "../utils/dictionary"

const noDefaultErrorHandling = (
  query: Query<unknown, unknown, unknown, QueryKey> | Mutation<unknown, unknown, unknown, unknown>
) => query.meta?.noDefaultErrorHandling

export const makeQueryClientDr = dictionaryRequirements({
  unknownError: true,
})

export function makeQueryClient(opts?: {
  dictionary: TDictionary<typeof makeQueryClientDr>
  router: AppRouterInstance
}) {
  return () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000,
        },
        dehydrate: {
          serializeData: superjson.serialize,
          /*
         This is a function that determines whether a query should be dehydrated or not. 
         Since the RSC transport protocol supports hydrating promises over the network, 
         we extend the defaultShouldDehydrateQuery function to also include queries that 
         are still pending. This will allow us to start prefetching in a server component 
         high up the tree, then consuming that promise in a client component further down.
         */
          shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
        },
        hydrate: {
          deserializeData: superjson.deserialize,
        },
      },
      queryCache: new QueryCache({
        onError: (error, query) => {
          if (!opts) return
          if (noDefaultErrorHandling(query)) return
          if (error instanceof TRPCClientError) {
            handleQueryError(error as TRPCClientErrorLike<AppRouter>, opts.dictionary, opts.router)
          } else {
            logger.error("Query error", error)
            toast.error(opts.dictionary.unknownError)
          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error, _v, _c, mutation) => {
          if (!opts) return
          if (noDefaultErrorHandling(mutation)) return
          if (error instanceof TRPCClientError) {
            handleMutationError(error as TRPCClientErrorLike<AppRouter>, opts.dictionary, opts.router)
          } else {
            logger.error("Mutation error", error)
            toast.error(opts.dictionary.unknownError)
          }
        },
      }),
    })
}
