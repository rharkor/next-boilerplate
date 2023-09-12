import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"
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
export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

const isAuthenticated = middleware(async (opts) => {
  const { ctx } = opts
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return opts.next()
})
export const authenticatedProcedure = publicProcedure.use(isAuthenticated)
