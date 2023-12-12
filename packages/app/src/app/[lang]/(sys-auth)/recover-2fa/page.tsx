import Link from "next/link"
import { Locale } from "i18n-config"

import LocaleSwitcher from "@/components/locale-switcher"
import { ThemeSwitch } from "@/components/theme/theme-switch"
import { authRoutes } from "@/lib/auth/constants"
import { getDictionary } from "@/lib/langs"

import Recover2FAForm from "./form"

export default async function Recover2FA({
  searchParams,
  params: { lang },
}: {
  searchParams: { [key: string]: string | string[] | undefined }
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)
  const email = searchParams.email as string | undefined

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{dictionary.recover2FA}</h1>
      <Recover2FAForm dictionary={dictionary} email={email} />
      <Link href={authRoutes.signIn[0]} className="text-muted-foreground hover:text-primary text-sm">
        {dictionary.goToSignInPage}
      </Link>
      <div className="fixed right-3 top-3 z-10 flex flex-row gap-3">
        <ThemeSwitch />
        <LocaleSwitcher lang={lang} />
      </div>
    </main>
  )
}
