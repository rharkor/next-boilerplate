import { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/types/auth"
import { env } from "env.mjs"
import { bcryptCompare } from "../bcrypt"
import { prisma } from "../prisma"

export const nextAuthOptions: NextAuthOptions = {
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

        const user = await prisma.user.findFirst({
          where: { email: creds.email },
        })

        if (!user) {
          return null
        }

        const isValidPassword = await bcryptCompare(user.password, creds.password)

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
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.email = user.email
      }

      return token
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
}
