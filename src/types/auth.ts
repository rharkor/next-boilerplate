import { DefaultSession } from "next-auth"
import * as z from "zod"
import { TDictionary } from "@/lib/langs"
import { signInSchema, signUpSchema } from "@/lib/schemas/auth"

export type ISignIn = (dictionary: TDictionary) => apiInputFromSchema<typeof signInSchema>
export type ISignUp = z.infer<ReturnType<typeof signUpSchema>>

export type Session = {
  id?: unknown
  email?: string | null
} & DefaultSession
