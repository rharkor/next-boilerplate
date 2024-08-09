import Header from "@/components/ui/header"
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

  return (
    <section className="flex w-full flex-col gap-5">
      <Header title={dictionary.plugins} />
      <PluginsContent ssrPlugins={ssrPlugins} />
    </section>
  )
}
