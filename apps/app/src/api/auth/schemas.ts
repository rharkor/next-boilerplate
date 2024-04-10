import * as z from "zod"

import { maxPasswordLength, minPasswordLength } from "@/constants/auth"
import { TDictionary } from "@/lib/langs"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const passwordSchemaDr = dictionaryRequirements({
  errors: {
    password: {
      required: true,
      min8: true,
      max25: true,
    },
  },
})
export const passwordSchema = (dictionary?: TDictionary<typeof passwordSchemaDr>) =>
  z
    .string({
      required_error: dictionary && dictionary.errors.password.required,
    })
    .min(minPasswordLength, dictionary && dictionary.errors.password.min8)
    .max(maxPasswordLength, dictionary && dictionary.errors.password.max25)

export const passwordSchemaWithRegexDr = dictionaryRequirements(
  {
    errors: {
      password: {
        regex: true,
      },
    },
  },
  passwordSchemaDr
)
export const passwordSchemaWithRegex = (dictionary?: TDictionary<typeof passwordSchemaWithRegexDr>) =>
  passwordSchema(dictionary).regex(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*\.]).{8,}$/,
    dictionary && dictionary.errors.password.regex
  )

export const usernameSchemaDr = dictionaryRequirements({
  errors: {
    username: {
      required: true,
      min3: true,
      max30: true,
    },
  },
})
export const usernameSchema = (dictionary?: TDictionary<typeof usernameSchemaDr>) =>
  z
    .string({
      required_error: dictionary && dictionary.errors.username.required,
    })
    .min(3, dictionary && dictionary.errors.username.min3)
    .max(30, dictionary && dictionary.errors.username.max30)

export const emailSchemaDr = dictionaryRequirements({
  errors: {
    email: {
      required: true,
      invalid: true,
    },
  },
})
export const emailSchema = (dictionary?: TDictionary<typeof emailSchemaDr>) =>
  z
    .string({
      required_error: dictionary && dictionary.errors.email.required,
    })
    .email(dictionary && dictionary.errors.email.invalid)

export const signInSchemaDr = dictionaryRequirements(
  {
    errors: {
      password: {
        max25: true,
      },
    },
  },
  emailSchemaDr
)
export const signInSchema = (dictionary?: TDictionary<typeof signInSchemaDr>) =>
  z.object({
    email: emailSchema(dictionary),
    password: z.string().max(maxPasswordLength, dictionary && dictionary.errors.password.max25), //? Do not use the password schema because we don't want to tell why the password is invalid
    otp: z.string().optional(),
  })

export const signUpSchemaDr = dictionaryRequirements(signInSchemaDr, usernameSchemaDr, passwordSchemaWithRegexDr)
export const signUpSchema = (dictionary?: TDictionary<typeof signUpSchemaDr>) =>
  signInSchema(dictionary).extend({
    username: usernameSchema(dictionary),
    password: passwordSchemaWithRegex(dictionary),
    locale: z.string(),
  })

export const generateTotpSecretResponseSchema = () =>
  z.object({
    success: z.boolean(),
    url: z.string(),
    mnemonic: z.string(),
  })

export const verifyTotpSchema = () =>
  z.object({
    token: z.string(),
  })

export const verifyTotpResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const desactivateTotpSchema = () =>
  z.object({
    token: z.string(),
  })

export const desactivateTotpResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })

export const recover2FASchemaDr = dictionaryRequirements(emailSchemaDr, {
  mnemonic: {
    invalid: true,
  },
})
export const recover2FASchema = (dictionary?: TDictionary<typeof recover2FASchemaDr>) =>
  z.object({
    email: emailSchema(dictionary),
    mnemonic: z.string().refine((value) => value.split(" ").filter((v) => !!v).length === 12, {
      message: dictionary && dictionary.mnemonic.invalid,
    }),
  })

export const recover2FAResponseSchema = () =>
  z.object({
    success: z.boolean(),
  })
