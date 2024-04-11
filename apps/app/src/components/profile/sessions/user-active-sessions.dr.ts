import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { SessionsTableDr } from "./sessions-table.dr"

export const UserActiveSessionsDr = dictionaryRequirements(
  {
    profilePage: true,
  },
  SessionsTableDr
)
