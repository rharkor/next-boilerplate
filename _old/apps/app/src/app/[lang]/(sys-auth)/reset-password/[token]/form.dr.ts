import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const ResetPasswordFormDr = dictionaryRequirements({
  resetPasswordSuccessDescription: true,
  password: true,
  passwordConfirmation: true,
  reset: true,
  errors: {
    passwordsDoNotMatch: true,
    password: true,
  },
})
