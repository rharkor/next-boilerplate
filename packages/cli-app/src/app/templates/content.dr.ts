import { ChooseStoreDr } from "@/components/choose-store.dr"
import { HeaderDr } from "@/components/ui/header.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const TemplatesContentDr = dictionaryRequirements(
  {
    templates: true,
    search: true,
    stores: true,
  },
  HeaderDr,
  ChooseStoreDr
)
