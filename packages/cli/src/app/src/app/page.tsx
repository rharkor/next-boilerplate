import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

import { ProjectInitDr } from "./components/project-init.dr"
import MainContent from "./content"
import { MainContentDr } from "./content.dr"

export default async function Home() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements(MainContentDr, ProjectInitDr))
  const ssrConfiguration = await serverTrpc.configuration.getConfiguration()

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col gap-4 p-3 py-8">
      <MainContent dictionary={dictionary} ssrConfiguration={ssrConfiguration} lang={locale} />
    </main>
  )
}
