import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import { signInSchema } from "@/types/auth"
import { env } from "env.mjs"
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
      authorize: async (credentials) => {
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

        logger.debug("User logged in", user.id)
        return {
          id: user.id.toString(),
          email: user.email,
          username: user.username,
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
      if (user) {
        token.id = user.id
        token.email = user.email
        if ("username" in user) token.username = user.username
        if ("role" in user) token.role = user.role
      }

      return token
    },
    session: async ({ session, token }) => {
      const sessionFilled = {
        ...session,
        user: {
          ...session.user,
          id: token?.id,
          username: token && "username" in token ? token.username : undefined,
          role: token && "role" in token ? token.role : undefined,
        },
      }
      return sessionFilled
    },
  },
  jwt: {
    secret: env.JWT_SECRET,
    maxAge: 30 * 24 * 30 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
  },
  session: {
    strategy: "jwt", //? Strategy database could not work with credentials provider for security reasons
  },
}
