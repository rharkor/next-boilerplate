import { DefaultSession } from "next-auth"
import * as z from "zod"

export const passwordSchema = z
  .string()
  .min(4, "Password must be at least 4 characters long")
  .max(16, "Password must be at most 16 characters long")

export const passwordSchemaWithRegex = passwordSchema.regex(
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/,
  "Password must contain at least one uppercase letter, one lowercase letter, and one number"
)

export const signInSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
})

export const signUpSchema = signInSchema.extend({
  username: z.string(),
  password: passwordSchemaWithRegex,
})

export type ISignIn = z.infer<typeof signInSchema>
export type ISignUp = z.infer<typeof signUpSchema>

export type Session = {
  id?: unknown
  email?: string | null
} & DefaultSession
