import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { UpdateAccountDr } from "./update-account.dr"

export const ProfileDetailsDr = dictionaryRequirements(
  {
    profilePage: true,
  },
  UpdateAccountDr
)
