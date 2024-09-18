import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { HeaderDr } from "./ui/header.dr"

export const ChooseStoreDr = dictionaryRequirements({ selectStore: true, storeVersion: true, search: true }, HeaderDr)
