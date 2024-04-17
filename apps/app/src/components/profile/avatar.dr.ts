import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { FileUploadDr } from "../ui/file-upload.dr"

export const UpdateAvatarDr = dictionaryRequirements(
  {
    updateAvatar: true,
    errors: {
      noFileSelected: true,
      fileTooLarge: true,
    },
    unknownError: true,
  },
  FileUploadDr
)
