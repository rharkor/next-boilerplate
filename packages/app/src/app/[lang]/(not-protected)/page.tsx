import { Button, Link } from "@nextui-org/react"
import LocaleSwitcher from "@/components/locale-switcher"
import { ThemeSwitch } from "@/components/theme/theme-switch"
import { authRoutes } from "@/lib/auth/constants"
import { getDictionary } from "@/lib/langs"
import { Locale } from "i18n-config"

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <>
      <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
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
      <div className="fixed right-3 top-3 z-10 flex flex-row gap-3">
        <ThemeSwitch />
        <LocaleSwitcher lang={lang} />
      </div>
    </>
  )
}
