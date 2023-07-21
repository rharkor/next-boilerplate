import * as z from "zod"

export const passwordSchema = z.string().min(4).max(16)

export const signInSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
})

export const signUpSchema = signInSchema.extend({
  username: z.string(),
})

export type ISignIn = z.infer<typeof signInSchema>
export type ISignUp = z.infer<typeof signUpSchema>
