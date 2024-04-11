import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const PrivacyAcceptanceDr = dictionaryRequirements({
  auth: {
    clickingAggreement: true,
    termsOfService: true,
    privacyPolicy: true,
  },
  and: true,
})
