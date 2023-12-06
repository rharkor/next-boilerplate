import { Locale } from "i18n-config"

import { getDictionary } from "@/lib/langs"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)

  return <main className="flex min-h-screen flex-col items-center justify-between p-24">{dictionary.home}</main>
}
