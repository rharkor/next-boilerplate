import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const WithPasswordStrengthPopoverDr = dictionaryRequirements({
  min8Chars: true,
  containsNumber: true,
  containsLowercase: true,
  containsUppercase: true,
  containsSpecial: true,
})

export const FormFieldDr = dictionaryRequirements(WithPasswordStrengthPopoverDr)
