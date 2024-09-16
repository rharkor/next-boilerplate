import { getDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import MainContent from "./content"
import { MainContentDr } from "./content.dr"

export default async function Home() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements(MainContentDr))
  const ssrConfiguration = await trpc.configuration.getConfiguration()

  return <MainContent dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
}
