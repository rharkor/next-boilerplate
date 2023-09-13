import { z } from "zod"
import { usernameSchema } from "./auth"
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
