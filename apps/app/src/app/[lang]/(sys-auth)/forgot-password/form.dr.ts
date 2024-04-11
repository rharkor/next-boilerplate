import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const ForgotPasswordFormDr = dictionaryRequirements({
  forgotPasswordSuccessDescription: true,
  emailPlaceholder: true,
  email: true,
  errors: {
    email: true,
  },
  send: true,
  timeUntilYouCanRequestAnotherEmail: true,
})
