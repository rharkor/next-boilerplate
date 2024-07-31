import { z } from "zod"

import { logger } from "@next-boilerplate/lib"

import { dictionaryRequirements } from "./utils/dictionary"
import { TDictionary } from "./langs"

export const queriesOptionPageDr = dictionaryRequirements({
  errors: {
    typeError: {
      number: {
        invalid: true,
        required: true,
      },
    },
  },
})
export const queriesOptionPage = (dictionary?: TDictionary<typeof queriesOptionPageDr>) =>
  z
    .number({
      invalid_type_error: dictionary?.errors.typeError.number.invalid,
      required_error: dictionary?.errors.typeError.number.required,
    })
    .positive()
    .int()

export const queriesOptionPerPageDr = dictionaryRequirements({
  errors: {
    typeError: {
      number: {
        invalid: true,
        required: true,
      },
    },
  },
})
export const queriesOptionPerPage = (dictionary?: TDictionary<typeof queriesOptionPerPageDr>) =>
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

export const queriesOptionSortDr = dictionaryRequirements({
  errors: {
    typeError: {
      string: {
        invalid: true,
        required: true,
      },
    },
  },
})
export const queriesOptionSort = (dictionary?: TDictionary<typeof queriesOptionSortDr>) =>
  z.array(
    z.object({
      field: z.string({
        invalid_type_error: dictionary?.errors.typeError.string.invalid,
        required_error: dictionary?.errors.typeError.string.required,
      }),
      direction: z.enum(["asc", "desc"]),
    })
  )
