import { Session } from "next-auth"
import superjson from "superjson"
import { ZodError } from "zod"

import { getAuthApi } from "@/components/auth/require-auth"
import { env } from "@/lib/env"
import { User } from "@prisma/client"
import { initTRPC } from "@trpc/server"

import { apiRateLimiter } from "../rate-limit"
import { Context } from "../trpc/context"
import { ApiError } from "../utils/server-utils"

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
  const { session } = await getAuthApi()

  if (!session) {
    await ApiError("unauthorized", "UNAUTHORIZED")
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      session,
    },
  })
})
const hasVerifiedEmail = middleware(async (opts) => {
  const { ctx } = opts
  const session = ctx.session as (Session & { user: Omit<User, "password"> }) | null
  if (!session || (!session.user.emailVerified && env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE === true)) {
    await ApiError("emailNotVerified", "UNAUTHORIZED", {
      redirect: false,
    })
  }
  return opts.next()
})
export const authenticatedProcedure = publicProcedure.use(isAuthenticated).use(hasVerifiedEmail)
export const authenticatedNoEmailVerificationProcedure = publicProcedure.use(isAuthenticated)
