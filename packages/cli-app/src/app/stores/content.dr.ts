import { HeaderDr } from "@/components/ui/header.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const StoresContentDr = dictionaryRequirements(
  {
    stores: true,
    search: true,
    addStore: true,
    storeName: true,
    storeNameExample: true,
    storeVersion: true,
    storeVersionExample: true,
    close: true,
    save: true,
    doNotTrustExternalStores: true,
    remove: true,
    update: true,
  },
  HeaderDr
)
