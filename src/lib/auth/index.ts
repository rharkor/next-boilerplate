import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import requestIp from "request-ip"
import { randomUUID } from "crypto"
import { signInSchema } from "@/types/auth"
import { env } from "env.mjs"
import { authRoutes, JWT_MAX_AGE } from "./constants"
import { bcryptCompare } from "../bcrypt"
import { logger } from "../logger"
import { prisma } from "../prisma"

export const nextAuthOptions: NextAuthOptions = {
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
        const creds = await signInSchema.parseAsync(credentials)

        if (!creds.email || !creds.password) {
          logger.debug("Missing credentials", creds)
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        })

        if (!user) {
          logger.debug("User not found", creds.email)
          return null
        }

        if (!user.password) {
          //? this should happen if the user signed up with a provider
          throw new Error("You signed up with a provider, please sign in with it")
        }

        const isValidPassword = await bcryptCompare(creds.password, user.password)

        if (!isValidPassword) {
          logger.debug("Invalid password", user.id)
          return null
        }

        //* Store user agent and ip address in session
        const uuid = randomUUID()
        const ua = req.headers?.["user-agent"] ?? ""
        const ip = requestIp.getClientIp(req) ?? ""
        await prisma.session.create({
          data: {
            userId: user.id,
            expires: new Date(Date.now() + JWT_MAX_AGE * 1000),
            ua,
            ip,
            sessionToken: uuid,
          },
        })

        logger.debug("User logged in", user.id)
        return {
          id: user.id.toString(),
          email: user.email,
          username: user.username,
          uuid,
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
      if (user) {
        token.id = user.id
        token.email = user.email
        if ("username" in user) token.username = user.username
        if ("role" in user) token.role = user.role
        if ("uuid" in user) token.uuid = user.uuid
      }

      return token
    },
    session: async ({ session, token }) => {
      // logger.debug("Session token", token)
      const sessionFilled = {
        ...session,
        user: {
          ...session.user,
          id: token?.id,
          username: token && "username" in token ? token.username : undefined,
          role: token && "role" in token ? token.role : undefined,
          uuid: token && "uuid" in token ? token.uuid : undefined,
        },
      }
      return sessionFilled
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
