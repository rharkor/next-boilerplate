import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { CopiableDr } from "../ui/copiable.dr"

export const LoginUserAuthFormDr = dictionaryRequirements(
  {
    errors: {
      wrongProvider: true,
      password: true,
      email: true,
      invalidCredentials: true,
      otpInvalid: true,
    },
    auth: true,
    email: true,
    password: true,
    forgotPassword: true,
    signIn: true,
    totp: {
      enterCode: true,
      lostYourDevice: true,
    },
    confirm: true,
    cancel: true,
    unknownError: true,
  },
  CopiableDr
)
