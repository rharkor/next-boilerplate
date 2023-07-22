import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import { signInSchema } from "@/types/auth"
import { env } from "env.mjs"
import { bcryptCompare } from "../bcrypt"
import { prisma } from "../prisma"

export const nextAuthOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
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
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          //? this should happen if the user signed up with a provider
          return null
        }

        const isValidPassword = await bcryptCompare(creds.password, user.password)

        if (!isValidPassword) {
          return null
        }

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
      }

      return token
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      }
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
    strategy: "jwt",
  },
}
