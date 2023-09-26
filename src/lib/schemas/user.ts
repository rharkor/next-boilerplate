import { z } from "zod"
import { emailSchema, usernameSchema } from "./auth"
import { jsonApiQuerySchema, jsonApiResponseSchema } from "../json-api"
import { TDictionary } from "../langs"

export const userSchema = (dictionary?: TDictionary) =>
  z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    emailVerified: z.date().nullable(),
    image: z.string().nullable(),
    username: usernameSchema(dictionary).nullable(),
    role: z.string(),
  })

export const updateUserSchema = (dictionary?: TDictionary) =>
  z.object({
    username: usernameSchema(dictionary),
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
    expires: z.date(),
    ua: z.string(),
    ip: z.string(),
    lastUsedAt: z.date().nullable(),
    createdAt: z.date(),
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
  z
    .object({
      id: z.string(),
      sessionToken: z.never().optional(),
    })
    .or(
      z.object({
        id: z.never().optional(),
        sessionToken: z.string(),
      })
    )

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
      password: z.string(),
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
  z.object({
    email: emailSchema(dictionary),
    silent: z.boolean().optional(),
  })

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
