import { NextAuthOptions, Session } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import { Provider } from "next-auth/providers/index"
import { randomUUID } from "crypto"
import * as OTPAuth from "otpauth"
import requestIp from "request-ip"
import { z } from "zod"

import { sendVerificationEmail } from "@/api/me/email/mutations"
import { otpWindow } from "@/constants"
import { authRoutes, JWT_MAX_AGE } from "@/constants/auth"
import { env } from "@/lib/env"
import { i18n } from "@/lib/i18n-config"
import { ITrpcContext } from "@/types"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { logger } from "@next-boilerplate/lib"

import { signInSchema } from "../../api/auth/schemas"
import { sessionsSchema } from "../../api/me/schemas"
import { bcryptCompare } from "../bcrypt"
import { getDictionary } from "../langs"
import { prisma } from "../prisma"
import { redis } from "../redis"
import { ensureRelativeUrl } from "../utils"
import { dictionaryRequirements } from "../utils/dictionary"

export const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "youremail@gmail.com",
      },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials, req) => {
      const referer = req.headers?.referer ?? ""
      const refererUrl = ensureRelativeUrl(referer)
      const lang = i18n.locales.find((locale) => refererUrl.startsWith(`/${locale}/`)) ?? i18n.defaultLocale
      const dr = dictionaryRequirements(
        {
          errors: {
            password: {
              max25: true,
            },
            wrongProvider: true,
          },
        },
        {
          errors: {
            email: {
              required: true,
              invalid: true,
            },
          },
        }
      )
      const dictionary = await getDictionary(lang, dr)

      const creds = signInSchema(dictionary).parse(credentials)

      if (!creds.email || !creds.password) {
        logger.debug("Missing credentials", creds)
        return null
      }

      const user = await prisma.user.findUnique({
        where: { email: creds.email },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          password: true,
          emailVerified: true,
          hasPassword: true,
        },
      })

      if (!user) {
        logger.debug("User not found", creds.email)
        return null
      }

      if (!user.password) {
        //? this should happen if the user signed up with a provider
        throw new Error(dictionary.errors.wrongProvider)
      }

      const isValidPassword = await bcryptCompare(creds.password, user.password)

      if (!isValidPassword) {
        logger.debug("Invalid password", user.id)
        return null
      }

      //* Store user agent and ip address in session
      const uuid = randomUUID()
      try {
        const ua = req.headers?.["user-agent"] ?? ""
        const ip = requestIp.getClientIp(req) ?? ""
        const expires = new Date(Date.now() + JWT_MAX_AGE * 1000)
        const body: z.infer<ReturnType<typeof sessionsSchema>> = {
          id: uuid,
          userId: user.id,
          expires,
          ua,
          ip,
          sessionToken: uuid,
          lastUsedAt: new Date(),
          createdAt: new Date(),
        }
        await redis.setex(`session:${user.id}:${uuid}`, JWT_MAX_AGE, JSON.stringify(body))
      } catch (error) {
        logger.error("Error creating session", error)
      }

      // logger.debug("User logged in", user.id)
      return {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        uuid,
        emailVerified: user.emailVerified,
        hasPassword: user.hasPassword,
      }
    },
  }),
]

if (env.DISABLE_REGISTRATION !== true) {
  providers.push(
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    })
  )
}

export const providersByName: {
  [key: string]: Provider | undefined
} = providers.reduce<{
  [key: string]: Provider | undefined
}>((acc, cur) => {
  acc[cur.name] = cur
  return acc
}, {})

export const nextAuthOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma), //? Require to use database
  providers,
  callbacks: {
    jwt: async ({ token, user }) => {
      // logger.debug("JWT token", token)
      if (user) {
        token.id = user.id
        token.email = user.email
        if ("hasPassword" in user) token.hasPassword = user.hasPassword as boolean
        if ("username" in user) token.username = user.username
        if ("role" in user) token.role = user.role as string
        if ("uuid" in user) token.uuid = user.uuid as string
        if ("emailVerified" in user) token.emailVerified = user.emailVerified as Date
        //* Send verification email if needed
        if (user.email && "emailVerified" in user && !user.emailVerified) {
          const dbUser = await prisma.user.findUnique({
            where: {
              email: user.email.toLowerCase(),
            },
          })
          if (!dbUser) throw new Error("User not found")
          await sendVerificationEmail({ input: { user: dbUser, silent: true }, ctx: {} as ITrpcContext })
        }
      }
      return token
    },
    session: async ({ session, token }) => {
      // logger.debug("Session token", token)
      if (!token.id || typeof token.id !== "string") {
        logger.debug("Missing token id")
        return {} as Session
      }
      //* Verify that the user still exists
      const dbUser = await prisma.user.findUnique({
        where: {
          id: token.id,
        },
      })
      if (!dbUser) {
        // logger.debug("User not found", token.id)
        return {} as Session
      }
      //* Verify that the session still exists
      if (dbUser.hasPassword && (!token.uuid || typeof token.uuid !== "string")) {
        logger.debug("Missing token uuid")
        return {} as Session
      }
      if (token.uuid) {
        const getRedisSession = async () => {
          const key = `session:${dbUser.id}:${token.uuid}`
          const loginSession = await redis.get(key)
          if (!loginSession) {
            logger.debug("Session not found", token.uuid)
            return {} as Session
          }

          //? Only if lastUsedAt is older than 1 minute (avoid spamming the redis server)
          const data = JSON.parse(loginSession) as z.infer<ReturnType<typeof sessionsSchema>>
          if (data.lastUsedAt) {
            const lastUsedAt = new Date(data.lastUsedAt)
            const now = new Date()
            const diff = now.getTime() - lastUsedAt.getTime()
            if (diff > 1000 * 60) {
              return
            }
          }
          //? Update session lastUsed
          const remainingTtl = await redis.ttl(key)
          //! Do not await to make the requests faster
          redis.setex(
            key,
            remainingTtl,
            JSON.stringify({
              ...(JSON.parse(loginSession) as object),
              lastUsedAt: new Date(),
            })
          )
          return
        }
        const res = await getRedisSession()

        if (res !== undefined) {
          return res
        }
      }
      //* Fill session with user data
      const username = dbUser.username
      const role = dbUser.role
      const hasPassword = dbUser.hasPassword
      const emailVerified = dbUser.emailVerified
      //* Fill session with token data
      const uuid = "uuid" in token ? token.uuid : undefined
      const sessionFilled = {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: username ?? undefined,
          role,
          uuid,
          hasPassword,
          emailVerified,
        },
      }
      return sessionFilled
    },
    async signIn({ user, credentials, account }) {
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: user.email.toLowerCase(),
          },
        })
        if (!dbUser) return true
        //* Send verification email if needed
        await sendVerificationEmail({ input: { user: dbUser, silent: true }, ctx: {} as ITrpcContext })
        //* Redirect to otp page if needed
        const userHasOtp = dbUser?.otpVerified
        const provId = account?.provider
        if (
          provId === "credentials" &&
          userHasOtp &&
          (!credentials?.otp || typeof credentials.otp !== "string" || credentials.otp === "undefined")
        ) {
          throw new Error("OTP_REQUIRED")
        } else if (userHasOtp && credentials?.otp) {
          //? Check the otp
          const totp = new OTPAuth.TOTP({
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: dbUser.otpSecret,
          })
          const isValid =
            totp.validate({
              token: credentials.otp as string,
              window: otpWindow,
            }) !== null
          if (!isValid) {
            throw new Error("OTP_INVALID")
          }
        }
      }
      return true
    },
  },
  jwt: {
    maxAge: JWT_MAX_AGE,
  },
  pages: {
    signIn: authRoutes.signIn[0],
    newUser: authRoutes.signUp[0],
    error: authRoutes.signIn[0],
  },
  session: {
    strategy: "jwt", //? Strategy database could not work with credentials provider for security reasons
  },
  logger: {
    error(code, metadata) {
      if (["CLIENT_FETCH_ERROR", "JWT_SESSION_ERROR"].includes(code)) return
      logger.error("error", code)
      logger.error(metadata)
    },
    warn(code) {
      logger.warn("warn", code)
    },
  },
}
