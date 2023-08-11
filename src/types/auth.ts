import { DefaultSession } from "next-auth"
import * as z from "zod"
import { TDictionary } from "@/lib/langs"
import { emailSchema, passwordSchema, passwordSchemaWithRegex, usernameSchema } from "./constants"

export const signInSchema = (dictionary?: TDictionary) =>
  z.object({
    email: emailSchema(dictionary),
    password: passwordSchema(dictionary),
  })

export const signUpSchema = (dictionary?: TDictionary) =>
  signInSchema(dictionary).extend({
    username: usernameSchema(dictionary),
    password: passwordSchemaWithRegex(dictionary),
  })

export type ISignIn = (dictionary: TDictionary) => z.infer<ReturnType<typeof signInSchema>>
export type ISignUp = z.infer<ReturnType<typeof signUpSchema>>

export type Session = {
  id?: unknown
  email?: string | null
} & DefaultSession
