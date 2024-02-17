import { z } from "zod"

import { defaultMaxPerPage } from "@/types/constants"
import { logger } from "@lib/logger"

import { TDictionary } from "./langs"

export type IMeta = {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export type ILinks = {
  first: string
  last: string
  prev: string
  next: string
  self: string
}

export type IJsonApiErrorSchema = {
  status: string
  title: string
  detail: string
}

export type IJsonApiResponse<T> = {
  errors?: IJsonApiErrorSchema[]
  data?: T[]
  meta: IMeta
  links?: ILinks
}

export const jsonApiResponseSchema = () =>
  z.object({
    errors: z
      .array(
        z.object({
          status: z.string(),
          title: z.string(),
          detail: z.string(),
        })
      )
      .optional(),
    data: z.array(z.unknown()).optional(),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
    links: z
      .object({
        first: z.string(),
        last: z.string(),
        prev: z.string(),
        next: z.string(),
        self: z.string(),
      })
      .optional(),
  })

export type IJsonApiQuery = {
  page?: number
  perPage?: number
  sort?: {
    field: string
    direction: "asc" | "desc"
  }[]
  filter?: {
    field: string
    operator: string
    value: string
  }[]
  include?: string[]
  fields?: string[]
}

export const jsonApiQuerySchema = (
  dictionary?: TDictionary,
  {
    maxPerPage = defaultMaxPerPage,
  }: {
    maxPerPage?: number
  } = {}
) =>
  z.object({
    page: z
      .number({
        invalid_type_error: dictionary?.errors.typeError.number.invalid,
        required_error: dictionary?.errors.typeError.number.required,
      })
      .positive()
      .int()
      .optional(),
    perPage: z
      .number({
        invalid_type_error: dictionary?.errors.typeError.number.invalid,
        required_error: dictionary?.errors.typeError.number.required,
      })
      .positive()
      .int()
      .transform((value) => {
        if (value > maxPerPage) {
          logger.warn(`perPage value ${value} is greater than maxPerPage ${maxPerPage}.`)
          return maxPerPage
        }
        return value
      })
      .optional(),
    sort: z
      .array(
        z.object({
          field: z.string({
            invalid_type_error: dictionary?.errors.typeError.string.invalid,
            required_error: dictionary?.errors.typeError.string.required,
          }),
          direction: z.enum(["asc", "desc"]),
        })
      )
      .optional(),
    filter: z
      .object({
        field: z.string({
          invalid_type_error: dictionary?.errors.typeError.string.invalid,
          required_error: dictionary?.errors.typeError.string.required,
        }),
        operator: z.string({
          invalid_type_error: dictionary?.errors.typeError.string.invalid,
          required_error: dictionary?.errors.typeError.string.required,
        }),
        value: z
          .string({
            invalid_type_error: dictionary?.errors.typeError.string.invalid,
            required_error: dictionary?.errors.typeError.string.required,
          })
          .optional(),
      })
      .optional(),
    include: z
      .array(
        z.string({
          invalid_type_error: dictionary?.errors.typeError.string.invalid,
          required_error: dictionary?.errors.typeError.string.required,
        })
      )
      .optional(),
    fields: z
      .array(
        z.string({
          invalid_type_error: dictionary?.errors.typeError.string.invalid,
          required_error: dictionary?.errors.typeError.string.required,
        })
      )
      .optional(),
  })

const defaultPerPage = 10

export const getJsonApiSkip = (opts?: Pick<IJsonApiQuery, "page" | "perPage">) => {
  return (opts?.perPage ?? defaultPerPage) * ((opts?.page ?? 1) - 1)
}

export const getJsonApiTake = (opts?: Pick<IJsonApiQuery, "perPage">) => {
  return opts?.perPage ?? defaultPerPage
}

export const getJsonApiSort = (opts?: Pick<IJsonApiQuery, "sort">) => {
  if (!opts?.sort) return undefined

  return opts.sort.map((sort) => {
    const direction = sort.direction
    const field = sort.field
    return { [field]: direction }
  })
}
