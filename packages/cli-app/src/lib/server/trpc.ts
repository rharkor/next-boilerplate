import superjson from "superjson"
import { ZodError } from "zod"

import { initTRPC } from "@trpc/server"

import { Context } from "../trpc/context"

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.code === "BAD_REQUEST" && error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const createCallerFactory = t.createCallerFactory
export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure
