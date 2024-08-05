import { signUpSchemaDr } from "@/api/auth/schemas"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { FormFieldDr } from "../ui/form.dr"

export const formSchemaDr = dictionaryRequirements({ errors: { password: { dontMatch: true } } }, signUpSchemaDr)

export const formMinizedSchemaDr = dictionaryRequirements(signUpSchemaDr)

export const getFormSchemaDr = dictionaryRequirements(formMinizedSchemaDr, formSchemaDr)

export const RegisterUserAuthFormDr = dictionaryRequirements(
  {
    email: true,
    username: true,
    password: true,
    confirmPassword: true,
    signUp: true,
    edit: true,
    cancel: true,
    totp: {
      desactivateTitle: true,
      desactivate: true,
      lostYourDevice: true,
    },
    withEmail: true,
    unknownError: true,
    errors: {
      invalidCredentials: true,
      otpInvalid: true,
      wrongProvider: true,
    },
  },
  FormFieldDr,
  getFormSchemaDr
)
