import { PluginDr } from "@/app/plugins/plugin.dr"
import { HeaderDr } from "@/components/ui/header.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export const TemplateContentDr = dictionaryRequirements(
  {
    replaceConfiguration: true,
    plugins: true,
  },
  PluginDr,
  HeaderDr
)
