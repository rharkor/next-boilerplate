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

export type IJsonApiQueryWithDefaults = IJsonApiQuery & typeof jsonApiDefaults

export const parseJsonApiQuery = (
  query: URLSearchParams | string,
  defaults = jsonApiDefaults
): IJsonApiQueryWithDefaults => {
  const searchParams = new URLSearchParams(query)

  const page = searchParams.get("page")
  const perPage = searchParams.get("perPage")
  const sort = searchParams.get("sort")
  const filter = searchParams.get("filter")
  const include = searchParams.get("include")
  const fields = searchParams.get("fields")

  return {
    page: page ? parseInt(page) : defaults.page,
    perPage: perPage ? parseInt(perPage) : defaults.perPage,
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
