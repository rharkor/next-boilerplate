import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const CropContentDr = dictionaryRequirements({
  cancel: true,
  reset: true,
  save: true,
  loading: true,
})

export const ImageCropDr = dictionaryRequirements(
  {
    cropImage: true,
  },
  CropContentDr
)
