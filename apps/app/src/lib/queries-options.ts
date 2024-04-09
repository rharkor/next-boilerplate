import { z } from "zod"

import { logger } from "@next-boilerplate/lib"

import { TDictionary } from "./langs"

export const queriesOptionPage = (dictionary?: {
  errors: {
    typeError: {
      number: {
        invalid: TDictionary["errors"]["typeError"]["number"]["invalid"]
        required: TDictionary["errors"]["typeError"]["number"]["required"]
      }
    }
  }
}) =>
  z
    .number({
      invalid_type_error: dictionary?.errors.typeError.number.invalid(),
      required_error: dictionary?.errors.typeError.number.required(),
    })
    .positive()
    .int()

export const queriesOptionPerPage = (dictionary?: {
  errors: {
    typeError: {
      number: {
        invalid: TDictionary["errors"]["typeError"]["number"]["invalid"]
        required: TDictionary["errors"]["typeError"]["number"]["required"]
      }
    }
  }
}) =>
  z
    .number({
      invalid_type_error: dictionary?.errors.typeError.number.invalid(),
      required_error: dictionary?.errors.typeError.number.required(),
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

export const queriesOptionSort = (dictionary?: {
  errors: {
    typeError: {
      string: {
        invalid: TDictionary["errors"]["typeError"]["string"]["invalid"]
        required: TDictionary["errors"]["typeError"]["string"]["required"]
      }
    }
  }
}) =>
  z.array(
    z.object({
      field: z.string({
        invalid_type_error: dictionary?.errors.typeError.string.invalid(),
        required_error: dictionary?.errors.typeError.string.required(),
      }),
      direction: z.enum(["asc", "desc"]),
    })
  )
