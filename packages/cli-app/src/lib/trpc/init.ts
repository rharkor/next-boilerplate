import { cache } from "react"

import superjson from "superjson"

import { ITrpcContext } from "@/types"
import { initTRPC } from "@trpc/server"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
export const createTRPCContext = cache(async (opts?: CreateNextContextOptions | FetchCreateContextFnOptions) => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const response: ITrpcContext = {
    ...opts,
    session: null,
  }
  return response
})

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<ITrpcContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
})

// Base router and procedure helpers
export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory
