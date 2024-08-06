import NavSettings from "@/components/nav-settings"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements({
      homePage: {
        title: true,
      },
    })
  )

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <NavSettings lang={lang} />
      <h1 className="text-4xl font-bold">{dictionary.homePage.title}</h1>
    </main>
  )
}
