import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const SessionsTableDr = dictionaryRequirements({
  areYouAbsolutelySure: true,
  cancel: true,
  continue: true,
  profilePage: {
    profileDetails: {
      deleteLoggedDevice: {
        description: true,
      },
      lastUsed: true,
      created: true,
      expires: true,
      in: true,
    },
  },
  errors: {
    unavailableWithOAuth: true,
  },
  timeUnit: true,
})
