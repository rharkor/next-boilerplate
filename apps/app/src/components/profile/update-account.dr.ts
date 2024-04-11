import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { GenerateTotpDr } from "./totp/generate.dr"
import { UpdateAvatarDr } from "./avatar.dr"

export const UpdateAccountDr = dictionaryRequirements(
  {
    profilePage: {
      profileDetails: {
        username: true,
      },
    },
    errors: {
      emailNotVerified: true,
      username: true,
    },
    needSavePopup: true,
    reset: true,
    saveChanges: true,
  },
  UpdateAvatarDr,
  GenerateTotpDr
)
