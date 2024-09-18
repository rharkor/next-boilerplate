import { headers } from "next/headers"

import Section from "@/components/ui/section"
import { getDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import TemplatesContent from "./content"
import { TemplatesContentDr } from "./content.dr"

export default async function Templates() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements(TemplatesContentDr))

  const headersStore = headers()
  const url = new URL(headersStore.get("x-url") as string)
  let storeName = url.searchParams.get("storeName")
  if (storeName) storeName = decodeURIComponent(storeName)
  let storeVersion = url.searchParams.get("storeVersion")
  if (storeVersion) storeVersion = decodeURIComponent(storeVersion)

  const ssrTemplates =
    storeName && storeVersion
      ? await trpc.templates.getTemplates({
          store: {
            name: storeName,
            version: storeVersion,
          },
        })
      : undefined
  const ssrStores = await trpc.stores.getStores()

  return (
    <Section>
      <TemplatesContent
        initialStoreName={storeName}
        initialStoreVersion={storeVersion}
        ssrStores={ssrStores}
        ssrTemplates={ssrTemplates}
        dictionary={dictionary}
      />
    </Section>
  )
}
