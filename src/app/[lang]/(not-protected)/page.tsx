import Link from "next/link"
import LocaleSwitcher from "@/components/locale-switcher"
import { ThemeSwitch } from "@/components/theme/theme-switch"
import { buttonVariants } from "@/components/ui/button"
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
      <main className="container flex flex-1 flex-col items-center justify-center gap-3">
        <h1 className="text-4xl font-bold">{dictionary.homePage.title}</h1>
        <nav className="flex flex-col items-center justify-center">
          <ul className="flex flex-row items-center justify-center gap-2">
            <li>
              <Link href={authRoutes.signIn[0]} className={buttonVariants({ variant: "ghost" })}>
                {dictionary.signIn}
              </Link>
            </li>
            <li>
              <Link href={authRoutes.signUp[0]} className={buttonVariants({ variant: "ghost" })}>
                {dictionary.signUp}
              </Link>
            </li>
            <li>
              <Link href="/profile" className={buttonVariants({ variant: "ghost" })}>
                {dictionary.profile}
              </Link>
            </li>
          </ul>
        </nav>
      </main>
      <div className="fixed right-2 top-2 z-10 flex flex-row space-x-2">
        <LocaleSwitcher lang={lang} />
        <ThemeSwitch />
      </div>
    </>
  )
}
