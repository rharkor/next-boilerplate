import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const GenerateTotpDr = dictionaryRequirements({
  totp: {
    generate: true,
    desactivate: true,
    generateTitle: true,
    generateDescription: true,
    desactivateTitle: true,
    generateStep1: true,
    generateStep1Description: true,
    generateStep2: true,
    generateStep2Description: true,
    generateStep3: true,
    generateStep4: true,
    totpDesactivated: true,
    lostYourDevice: true,
  },
  urlCopiedToClipboard: true,
  totpEnabled: true,
  continue: true,
  confirm: true,
  cancel: true,
  back: true,
})
