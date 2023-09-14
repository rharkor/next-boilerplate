import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions, Session } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import requestIp from "request-ip"
import { randomUUID } from "crypto"
import { isPossiblyUndefined, ITrpcContext } from "@/types"
import { env } from "env.mjs"
import { i18n, Locale } from "i18n-config"
import { authRoutes, JWT_MAX_AGE } from "./constants"
import { sendVerificationEmail } from "../api/me/email/mutation"
import { bcryptCompare } from "../bcrypt"
import { getDictionary, TDictionary } from "../langs"
import { logger } from "../logger"
import { prisma } from "../prisma"
import { signInSchema } from "../schemas/auth"
import { ensureRelativeUrl } from "../utils"

export const nextAuthOptions: NextAuthOptions & {
  loadedDictionary: Map<Locale, TDictionary>
} = {
  loadedDictionary: new Map(),
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma), //? Require to use database
  providers: [
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
        const referer = (req.headers?.referer as string | undefined) ?? ""
        const refererUrl = ensureRelativeUrl(referer)
        const lang = i18n.locales.find((locale) => refererUrl.startsWith(`/${locale}/`)) ?? i18n.defaultLocale
        const dictionary =
          nextAuthOptions.loadedDictionary.get(lang) ??
          (await (async () => {
            logger.debug("Loading dictionary in auth", lang)
            const dictionary = await getDictionary(lang)
            nextAuthOptions.loadedDictionary.set(lang, dictionary)
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
          await prisma.session.create({
            data: {
              userId: user.id,
              expires: new Date(Date.now() + JWT_MAX_AGE * 1000),
              ua,
              ip,
              sessionToken: uuid,
              lastUsedAt: new Date(),
              createdAt: new Date(),
            },
          })
        } catch (error) {
          logger.error("Error creating session", error)
        }

        //* Remove old sessions
        const { count } = await prisma.session.deleteMany({
          where: {
            userId: user.id,
            expires: {
              lt: new Date(),
            },
          },
        })
        logger.debug("Deleted old sessions", count)

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
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
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
        const loginSession = await prisma.session.findUnique({
          where: {
            sessionToken: token.uuid,
          },
        })
        if (!loginSession) {
          logger.debug("Session not found", token.uuid)
          return {} as Session
        } else {
          //? Update session lastUsed
          await prisma.session.update({
            where: {
              id: loginSession.id,
            },
            data: {
              lastUsedAt: new Date(),
            },
          })
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
    async signIn({ user }) {
      //* Send verification email if needed
      if (user.email) {
        logger.time("sendVerificationEmail")
        await sendVerificationEmail({ input: { email: user.email, silent: true }, ctx: {} as ITrpcContext })
        logger.timeEnd("sendVerificationEmail")
      }
      return true
    },
  },
  jwt: {
    secret: env.JWT_SECRET,
    maxAge: JWT_MAX_AGE, // 30 days
  },
  pages: {
    signIn: authRoutes.signIn[0],
    newUser: authRoutes.signUp[0],
  },
  session: {
    strategy: "jwt", //? Strategy database could not work with credentials provider for security reasons
  },
}
