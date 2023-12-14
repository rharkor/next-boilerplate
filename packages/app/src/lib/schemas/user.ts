import { z } from "zod"

import { jsonApiQuerySchema, jsonApiResponseSchema } from "../json-api"
import { TDictionary } from "../langs"

import { emailSchema, passwordSchemaWithRegex, usernameSchema } from "./auth"

export const userSchema = (dictionary?: TDictionary) =>
  z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    emailVerified: z.date().nullable(),
    image: z.string().nullable(),
    username: usernameSchema(dictionary).nullable(),
    role: z.string(),
    hasPassword: z.boolean(),
    otpVerified: z.boolean(),
    lastLocale: z.string().nullable(),
  })

export const updateUserSchema = (dictionary?: TDictionary) =>
  z.object({
    username: usernameSchema(dictionary).or(z.literal("")).optional(),
    image: z.string().optional().nullable(),
  })

export const updateUserResponseSchema = (dictionary?: TDictionary) =>
  z.object({
    user: userSchema(dictionary),
  })

export const sessionsSchema = () =>
  z.object({
    id: z.string(),
    sessionToken: z.string(),
    userId: z.string(),
    expires: z.coerce.date(),
    ua: z.string(),
    ip: z.string(),
    lastUsedAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
  })

export const getActiveSessionsSchema = (dictionary?: TDictionary) =>
  jsonApiQuerySchema(dictionary)
    .pick({
      page: true,
      perPage: true,
      sort: true,
    })
    .optional()

export const getActiveSessionsResponseSchema = () =>
  jsonApiResponseSchema().extend({
    data: z.array(sessionsSchema()).optional(),
  })

export const deleteSessionSchema = () =>
  z.object({
    id: z.string(),
  })

export const deleteSessionResponseSchema = () =>
  z.object({
    id: z.string(),
  })

export const getAccountResponseSchema = (dictionary?: TDictionary) =>
  z.object({
    user: userSchema(dictionary),
  })

export const deleteAccountResponseSchema = () =>
  z.object({
    user: z.object({
      id: z.string(),
    }),
  })

export const forgotPasswordSchema = (dictionary?: TDictionary) =>
  z.object({
    email: emailSchema(dictionary),
  })

export const forgotPasswordResponseSchema = () =>
  z.object({
    email: z.string(),
  })

export const resetPasswordSchema = (dictionary?: TDictionary) =>
  z
    .object({
      token: z.string(),
      password: passwordSchemaWithRegex(dictionary),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: dictionary?.errors.passwordsDoNotMatch ?? "Passwords do not match",
      path: ["passwordConfirmation"],
    })

export const resetPasswordResponseSchema = () =>
  z.object({
    user: userSchema(),
  })

export const sendVerificationEmailSchema = (dictionary?: TDictionary) =>
  z
    .object({
      user: userSchema(dictionary),
      silent: z.boolean().optional(),
      email: z.never().optional(),
    })
    .or(
      z.object({
        email: emailSchema(dictionary),
        silent: z.boolean().optional(),
        user: z.never().optional(),
      })
    )

export const sendVerificationEmailResponseSchema = () =>
  z.object({
    email: z.string(),
  })

export const verifyEmailSchema = () =>
  z.object({
    token: z.string(),
  })

export const verifyEmailResponseSchema = () =>
  z.object({
    user: userSchema(),
  })
