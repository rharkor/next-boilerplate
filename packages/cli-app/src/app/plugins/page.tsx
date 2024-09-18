import { headers } from "next/headers"

import Section from "@/components/ui/section"
import { getDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import PluginsContent from "./content"
import { PluginsContentDr } from "./content.dr"

export default async function Plugins() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements(PluginsContentDr))

  const headersStore = headers()
  const url = new URL(headersStore.get("x-url") as string)
  const storeName = url.searchParams.get("storeName")
  const storeVersion = url.searchParams.get("storeVersion")

  const ssrPlugins =
    storeName && storeVersion
      ? await trpc.plugins.getPlugins({
          store: {
            name: storeName,
            version: storeVersion,
          },
        })
      : undefined
  const ssrStores = await trpc.stores.getStores()
  const ssrConfiguration = await trpc.configuration.getConfiguration()

  return (
    <Section>
      <PluginsContent
        initialStoreName={storeName}
        initialStoreVersion={storeVersion}
        ssrStores={ssrStores}
        ssrPlugins={ssrPlugins}
        dictionary={dictionary}
        ssrConfiguration={ssrConfiguration}
      />
    </Section>
  )
}
