import Header from "@/components/ui/header"
import Section from "@/components/ui/section"
import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import PluginsContent from "./content"
import { PluginsContentDr } from "./content.dr"

export default async function Plugins() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements({ plugins: true }, PluginsContentDr))
  const ssrPlugins = await serverTrpc.plugins.getPlugins({})
  const ssrConfiguration = await serverTrpc.configuration.getConfiguration()

  return (
    <Section>
      <Header title={dictionary.plugins} />
      <PluginsContent ssrPlugins={ssrPlugins} dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
    </Section>
  )
}
