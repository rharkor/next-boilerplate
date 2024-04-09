import { z } from "zod"

import { queriesOptionPage, queriesOptionPerPage } from "@/lib/queries-options"
import { fileSchemaMinimal } from "@/schemas/file"

import { TDictionary } from "../../lib/langs"
import { emailSchema, passwordSchemaWithRegex, usernameSchema } from "../auth/schemas"

export const userSchema = (dictionary?: Parameters<typeof usernameSchema>[0]) =>
  z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    emailVerified: z.date().nullable(),
    profilePicture: fileSchemaMinimal().nullable(),
    username: usernameSchema(dictionary).nullable(),
    role: z.string(),
    hasPassword: z.boolean(),
    otpVerified: z.boolean(),
    lastLocale: z.string().nullable(),
  })

export const updateUserSchema = (dictionary?: Parameters<typeof usernameSchema>[0]) =>
  z.object({
    username: usernameSchema(dictionary).or(z.literal("")).optional(),
    profilePictureKey: z.string().optional().nullable(),
  })

export const updateUserResponseSchema = () =>
  z.object({
    user: userSchema(),
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

export const getActiveSessionsSchema = (
  dictionary?: Parameters<typeof queriesOptionPage>[0] & Parameters<typeof queriesOptionPerPage>[0]
) =>
  z.object({
    page: queriesOptionPage(dictionary),
    perPage: queriesOptionPerPage(dictionary),
  })

export const getActiveSessionsResponseSchema = () =>
  z.object({
    data: z.array(sessionsSchema()).optional(),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
  })

export const deleteSessionSchema = () =>
  z.object({
    id: z.string(),
  })

export const deleteSessionResponseSchema = () =>
  z.object({
    id: z.string(),
  })

export const getAccountResponseSchema = (dictionary?: Parameters<typeof usernameSchema>[0]) =>
  z.object({
    user: userSchema(dictionary),
  })

export const deleteAccountResponseSchema = () =>
  z.object({
    user: z.object({
      id: z.string(),
    }),
  })

export const forgotPasswordSchema = (dictionary?: Parameters<typeof emailSchema>[0]) =>
  z.object({
    email: emailSchema(dictionary),
  })

export const forgotPasswordResponseSchema = () =>
  z.object({
    email: z.string(),
  })

export const resetPasswordSchema = (
  dictionary?: {
    errors: {
      passwordsDoNotMatch: TDictionary["errors"]["passwordsDoNotMatch"]
    }
  } & Parameters<typeof passwordSchemaWithRegex>[0]
) =>
  z
    .object({
      token: z.string(),
      password: passwordSchemaWithRegex(dictionary),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: dictionary?.errors.passwordsDoNotMatch() ?? "Passwords do not match",
      path: ["passwordConfirmation"],
    })

export const resetPasswordResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const sendVerificationEmailSchema = (dictionary?: TDictionary) =>
  z
    .object({
      user: userSchema(dictionary).pick({
        id: true,
        emailVerified: true,
        lastLocale: true,
        email: true,
      }),
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
    success: z.boolean(),
  })
