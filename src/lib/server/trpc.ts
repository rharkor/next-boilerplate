import { User } from "@prisma/client"
import { initTRPC, TRPCError } from "@trpc/server"
import { Session } from "next-auth"
import superjson from "superjson"
import { ZodError } from "zod"
import { getAuthApi } from "@/components/auth/require-auth"
import { env } from "env.mjs"
import { prisma } from "../prisma"
import { apiRateLimiter } from "../rate-limit"
import { Context } from "../trpc/context"
import { throwableErrorsMessages } from "../utils/server-utils"

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
  const { session } = await getAuthApi()

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: throwableErrorsMessages.unauthorized })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = await prisma.user.findFirstOrThrow({
    where: {
      email: session.user.email,
    },
  })
  return opts.next({
    ctx: {
      ...opts.ctx,
      session: {
        ...session,
        user,
      } as Session & { user: Omit<User, "password"> },
    },
  })
})
const hasVerifiedEmail = middleware(async (opts) => {
  const { ctx } = opts
  const session = ctx.session as (Session & { user: Omit<User, "password"> }) | null
  if (!session || (!session.user.emailVerified && env.ENABLE_MAILING_SERVICE === true)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: throwableErrorsMessages.emailNotVerified })
  }
  return opts.next()
})
export const authenticatedProcedure = publicProcedure.use(isAuthenticated).use(hasVerifiedEmail)
export const authenticatedNoEmailVerificationProcedure = publicProcedure.use(isAuthenticated)
