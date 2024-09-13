import { HeaderDr } from "@/components/ui/header.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const StoresContentDr = dictionaryRequirements(
  {
    stores: true,
    search: true,
    addStore: true,
    storeRemote: true,
    storeRemoteExample: true,
    close: true,
    save: true,
  },
  HeaderDr
)
