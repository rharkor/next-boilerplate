import { getDictionary } from "@/lib/langs"
import { serverTrpc } from "@/lib/trpc/server"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { extractLocale } from "@/lib/utils/server-utils"

export default async function Templates() {
  const locale = extractLocale()
  const dictionary = await getDictionary(locale, dictionaryRequirements({}))
  const ssrConfiguration = await serverTrpc.configuration.getConfiguration()

  return <>templates</>
}
