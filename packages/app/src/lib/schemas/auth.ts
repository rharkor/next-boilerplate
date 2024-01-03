import * as z from "zod"

import { TDictionary } from "@/lib/langs"

import { maxPasswordLength, minPasswordLength } from "../auth/constants"

import { userSchema } from "./user"

export const passwordSchema = (dictionary?: TDictionary) =>
  z
    .string({
      required_error: dictionary && dictionary.errors.password.required,
    })
    .min(minPasswordLength, dictionary && dictionary.errors.password.min8)
    .max(maxPasswordLength, dictionary && dictionary.errors.password.max25)

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
    password: z.string().max(maxPasswordLength, dictionary && dictionary.errors.password.max25), //? Do not use the password schema because we don't want to tell why the password is invalid
    otp: z.string().optional(),
  })

export const signUpSchema = (dictionary?: TDictionary) =>
  signInSchema(dictionary).extend({
    username: usernameSchema(dictionary),
    password: passwordSchemaWithRegex(dictionary),
    locale: z.string(),
  })

export const signUpResponseSchema = (dictionary?: TDictionary) =>
  z.object({
    user: userSchema(dictionary),
  })

export const generateTotpSecretResponseSchema = () =>
  z.object({
    success: z.boolean(),
    url: z.string(),
    mnemonic: z.string(),
  })

export const verifyTotpSchema = () =>
  z.object({
    token: z.string(),
  })

export const verifyTotpResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const desactivateTotpSchema = () =>
  z.object({
    token: z.string(),
  })

export const desactivateTotpResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const recover2FASchema = (dictionary?: TDictionary) =>
  z.object({
    email: emailSchema(dictionary),
    mnemonic: z.string().refine((value) => value.split(" ").filter((v) => !!v).length === 12, {
      message: dictionary && dictionary.mnemonic.invalid,
    }),
  })

export const recover2FAResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })
