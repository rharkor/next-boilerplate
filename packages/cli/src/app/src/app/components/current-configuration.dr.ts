import { HeaderDr } from "@/components/ui/header.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { NoConfigurationDr } from "./no-configuration.dr"

export const CurrentConfigurationDr = dictionaryRequirements(
  {
    configuration: true,
    edit: true,
    delete: true,
    reset: true,
  },
  NoConfigurationDr,
  HeaderDr
)
