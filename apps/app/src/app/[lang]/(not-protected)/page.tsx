import NavSettings from "@/components/nav-settings"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { Button } from "@nextui-org/button"
import { Link } from "@nextui-org/link"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang, {
    homePage: {
      title: true,
    },
    profile: true,
  })

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <NavSettings lang={lang} />
      <h1 className="text-4xl font-bold">{dictionary.homePage.title}</h1>
      <nav className="flex flex-col items-center justify-center">
        <ul className="flex flex-row items-center justify-center gap-2">
          <li>
            <Button as={Link} href="/examples/profile" color="primary" variant="flat">
              {dictionary.profile}
            </Button>
          </li>
        </ul>
      </nav>
    </main>
  )
}
