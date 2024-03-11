import { z } from "zod"

import { logger } from "@next-boilerplate/lib/logger"

import { TDictionary } from "./langs"

export const queriesOptionPage = (dictionary?: TDictionary) =>
  z
    .number({
      invalid_type_error: dictionary?.errors.typeError.number.invalid,
      required_error: dictionary?.errors.typeError.number.required,
    })
    .positive()
    .int()

export const queriesOptionPerPage = (dictionary?: TDictionary) =>
  z
    .number({
      invalid_type_error: dictionary?.errors.typeError.number.invalid,
      required_error: dictionary?.errors.typeError.number.required,
    })
    .positive()
    .int()
    .transform((value) => {
      const maxPerPage = 20
      if (value > maxPerPage) {
        logger.debug(`perPage value ${value} is greater than maxPerPage ${maxPerPage}.`)
        return maxPerPage
      }
      return value
    })

export const queriesOptionSort = (dictionary?: TDictionary) =>
  z.array(
    z.object({
      field: z.string({
        invalid_type_error: dictionary?.errors.typeError.string.invalid,
        required_error: dictionary?.errors.typeError.string.required,
      }),
      direction: z.enum(["asc", "desc"]),
    })
  )
