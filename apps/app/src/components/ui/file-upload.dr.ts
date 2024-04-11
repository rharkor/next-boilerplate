import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { ImageCropDr } from "./image-crop.dr"

export const FileDr = dictionaryRequirements(ImageCropDr)

export const FileUploadDr = dictionaryRequirements(
  {
    uploadDescription: true,
  },
  FileDr
)
