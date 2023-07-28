import { DefaultSession } from "next-auth"
import * as z from "zod"
import { passwordSchema, passwordSchemaWithRegex, usernameSchema } from "./constants"

export const signInSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
})

export const signUpSchema = signInSchema.extend({
  username: usernameSchema,
  password: passwordSchemaWithRegex,
})

export type ISignIn = z.infer<typeof signInSchema>
export type ISignUp = z.infer<typeof signUpSchema>

export type Session = {
  id?: unknown
  email?: string | null
} & DefaultSession
