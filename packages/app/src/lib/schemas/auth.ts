import * as z from "zod"
import { TDictionary } from "@/lib/langs"
import { userSchema } from "./user"

export const passwordSchema = (dictionary?: TDictionary) =>
  z
    .string({
      required_error: dictionary && dictionary.errors.password.required,
    })
    .min(8, dictionary && dictionary.errors.password.min8)
    .max(25, dictionary && dictionary.errors.password.max25)

export const passwordSchemaWithRegex = (dictionary?: TDictionary) =>
  passwordSchema(dictionary).regex(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*\.]).{8,}$/,
    dictionary && dictionary.errors.password.regex
  )

export const usernameSchema = (dictionary?: TDictionary) =>
  z
    .string({
      required_error: dictionary && dictionary.errors.username.required,
    })
    .min(3, dictionary && dictionary.errors.username.min3)
    .max(30, dictionary && dictionary.errors.username.max30)

export const emailSchema = (dictionary?: TDictionary) =>
  z
    .string({
      required_error: dictionary && dictionary.errors.email.required,
    })
    .email(dictionary && dictionary.errors.email.invalid)

export const signInSchema = (dictionary?: TDictionary) =>
  z.object({
    email: emailSchema(dictionary),
    password: z.string(), //? Do not use the password schema because we don't want to tell why the password is invalid
  })

export const signUpSchema = (dictionary?: TDictionary) =>
  signInSchema(dictionary).extend({
    username: usernameSchema(dictionary),
    password: passwordSchemaWithRegex(dictionary),
  })

export const signUpResponseSchema = (dictionary?: TDictionary) =>
  z.object({
    user: userSchema(dictionary),
  })
