import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const Recover2FAFormDr = dictionaryRequirements({
  totp: {
    totpDesactivated: true,
  },
  mnemonic: true,
  errors: {
    email: true,
  },
  email: true,
  recover2FA: true,
  recover2FADescription: true,
  reset: true,
})
