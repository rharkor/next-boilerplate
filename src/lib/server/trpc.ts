import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"
import { apiRateLimiter } from "../rate-limit"
import { Context } from "../trpc/context"
import { throwableErrorsMessages } from "../utils"

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
export const middleware = t.middleware
const hasRateLimit = middleware(async (opts) => {
  if (opts.ctx.req) {
    const { headers } = await apiRateLimiter(opts.ctx.req)
    return opts.next({
      ctx: {
        Headers: headers,
      },
    })
  }
  return opts.next()
})
export const publicProcedure = t.procedure.use(hasRateLimit)
const isAuthenticated = middleware(async (opts) => {
  const { ctx } = opts
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: throwableErrorsMessages.unauthorized })
  }

  if (!ctx.session.user.emailVerified) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: throwableErrorsMessages.emailNotVerified })
  }
  return opts.next()
})
export const authenticatedProcedure = publicProcedure.use(isAuthenticated)
