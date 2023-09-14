import { z } from "zod"
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
  sort?: string[]
  filter?: {
    field: string
    operator: string
    value: string
  }[]
  include?: string[]
  fields?: string[]
}

export const jsonApiQuerySchema = (dictionary?: TDictionary) =>
  z.object({
    page: z
      .number({
        invalid_type_error: dictionary?.errors.typeError.number.invalid,
        required_error: dictionary?.errors.typeError.number.required,
      })
      .optional(),
    perPage: z
      .number({
        invalid_type_error: dictionary?.errors.typeError.number.invalid,
        required_error: dictionary?.errors.typeError.number.required,
      })
      .optional(),
    sort: z
      .string({
        invalid_type_error: dictionary?.errors.typeError.string.invalid,
        required_error: dictionary?.errors.typeError.string.required,
      })
      .optional(),
    filter: z
      .string({
        invalid_type_error: dictionary?.errors.typeError.string.invalid,
        required_error: dictionary?.errors.typeError.string.required,
      })
      .optional(),
    include: z
      .string({
        invalid_type_error: dictionary?.errors.typeError.string.invalid,
        required_error: dictionary?.errors.typeError.string.required,
      })
      .optional(),
    fields: z
      .string({
        invalid_type_error: dictionary?.errors.typeError.string.invalid,
        required_error: dictionary?.errors.typeError.string.required,
      })
      .optional(),
  })

export const jsonApiQuery = (query: IJsonApiQuery) => {
  const searchParams = new URLSearchParams()

  if (query.page) {
    searchParams.set("page", query.page.toString())
  }

  if (query.perPage) {
    searchParams.set("perPage", query.perPage.toString())
  }

  if (query.sort) {
    searchParams.set("sort", query.sort.join(","))
  }

  if (query.filter) {
    searchParams.set(
      "filter",
      query.filter
        .map((filter) => {
          return `${filter.field}${filter.operator}${filter.value}`
        })
        .join(",")
    )
  }

  if (query.include) {
    searchParams.set("include", query.include.join(","))
  }

  if (query.fields) {
    searchParams.set("fields", query.fields.join(","))
  }

  return searchParams
}

export const jsonApiDefaults = {
  page: 1,
  perPage: 10,
}

export const jsonApiSchema = (defaults = jsonApiDefaults) =>
  z.object({
    page: z.number().default(defaults.page).optional(),
    perPage: z.number().default(defaults.perPage).optional(),
    sort: z.string().optional(),
    filter: z.string().optional(),
    include: z.string().optional(),
    fields: z.string().optional(),
  })

export type IJsonApiQueryWithDefaults = IJsonApiQuery & typeof jsonApiDefaults

export const parseJsonApiQuery = (
  query?: z.infer<ReturnType<typeof jsonApiSchema>>,
  defaults = jsonApiDefaults
): IJsonApiQueryWithDefaults => {
  const { page, perPage, fields, filter, include, sort } = jsonApiSchema(defaults).parse(query ?? {})

  return {
    page: page ? page : defaults.page,
    perPage: perPage ? perPage : defaults.perPage,
    sort: sort ? sort.split(",") : undefined,
    filter: filter
      ? filter.split(",").map((filter) => {
          const [field, operator, value] = filter.split("")
          return { field, operator, value }
        })
      : undefined,
    include: include ? include.split(",") : undefined,
    fields: fields ? fields.split(",") : undefined,
  }
}

export const getJsonApiSkip = ({ page, perPage }: { page: number; perPage: number }) => {
  return perPage * (page - 1)
}

export const getJsonApiTake = ({ perPage }: { perPage: number }) => {
  return perPage
}

export const getJsonApiSort = ({ sort }: { sort?: string[] }) => {
  if (!sort) return undefined

  return sort.map((sort) => {
    const direction = sort[0] === "-" ? "desc" : "asc"
    const field = sort.replace(/^-/, "")
    return { [field]: direction }
  })
}
