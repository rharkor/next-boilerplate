import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { FormFieldDr } from "../ui/form.dr"

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
    errors: true,
    withEmail: true,
  },
  FormFieldDr
)
