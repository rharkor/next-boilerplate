import { Session } from "next-auth"
import { env } from "env.mjs"
import superjson from "superjson"
import { ZodError } from "zod"

import { getAuthApi } from "@/components/auth/require-auth"
import { User } from "@prisma/client"
import { initTRPC } from "@trpc/server"

import { prisma } from "../prisma"
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
export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure
const isAuthenticated = middleware(async (opts) => {
  const { session } = await getAuthApi()

  if (!session) {
    ApiError("unauthorized", "UNAUTHORIZED")
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
  if (!session || (!session.user.emailVerified && env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE === true)) {
    ApiError("emailNotVerified", "UNAUTHORIZED", {
      redirect: false,
    })
  }
  return opts.next()
})
export const authenticatedProcedure = publicProcedure.use(isAuthenticated).use(hasVerifiedEmail)
export const authenticatedNoEmailVerificationProcedure = publicProcedure.use(isAuthenticated)
