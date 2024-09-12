import { HeaderDr } from "@/components/ui/header.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { PluginDr } from "./plugin.dr"

export const PluginsContentDr = dictionaryRequirements({ plugins: true, search: true }, HeaderDr, PluginDr)
