import { Locale } from "i18n-config"

import NavSettings from "@/components/nav-settings"
import { authRoutes } from "@/lib/auth/constants"
import { getDictionary } from "@/lib/langs"
import { Button, Link } from "@nextui-org/react"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <NavSettings lang={lang} />
      <h1 className="text-4xl font-bold">{dictionary.homePage.title}</h1>
      <nav className="flex flex-col items-center justify-center">
        <ul className="flex flex-row items-center justify-center gap-2">
          <li>
            <Button as={Link} href={authRoutes.signIn[0]} color="primary" variant="flat">
              {dictionary.signIn}
            </Button>
          </li>
          <li>
            <Button as={Link} href={authRoutes.signUp[0]} color="primary" variant="flat">
              {dictionary.signUp}
            </Button>
          </li>
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
