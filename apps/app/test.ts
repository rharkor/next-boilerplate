import { UpdateAvatarDr } from "@/components/profile/avatar.dr"
import { GenerateTotpDr } from "@/components/profile/totp/generate.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

const main = async () => {
  const dr = dictionaryRequirements(
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
  console.log("here", dr)
}

main()
