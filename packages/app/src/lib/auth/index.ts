import { NextAuthOptions, Session } from "next-auth"
import { Provider } from "next-auth/providers"
import Credentials from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import { randomUUID } from "crypto"
import { env } from "env.mjs"
import { i18n, Locale } from "i18n-config"
import { authenticator } from "otplib"
import requestIp from "request-ip"
import { z } from "zod"

import { sendVerificationEmail } from "@/api/me/email/mutations"
import { isPossiblyUndefined, ITrpcContext } from "@/types"
import { logger } from "@lib/logger"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import { bcryptCompare } from "../bcrypt"
import { getDictionary, TDictionary } from "../langs"
import { prisma } from "../prisma"
import { redis } from "../redis"
import { signInSchema } from "../schemas/auth"
import { sessionsSchema } from "../schemas/user"
import { ensureRelativeUrl } from "../utils"

import { authRoutes, JWT_MAX_AGE } from "./constants"

const loadedDictionary: Map<Locale, TDictionary> = new Map()

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
      const dictionary =
        loadedDictionary.get(lang) ??
        (await (async () => {
          //? Load the dictionary
          const dictionary = await getDictionary(lang)
          loadedDictionary.set(lang, dictionary)
          return dictionary
        })())

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

      logger.debug("User logged in", user.id)
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

if (env.ENABLE_REGISTRATION) {
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
      if (isPossiblyUndefined(user)) {
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
        logger.debug("User not found", token.id)
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
          const isValid = authenticator.check(credentials.otp as string, dbUser.otpSecret)
          if (!isValid) {
            throw new Error("OTP_INVALID")
          }
        }
      }
      return true
    },
  },
  jwt: {
    maxAge: JWT_MAX_AGE, // 30 days
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
