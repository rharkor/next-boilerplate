import Link from "next/link"
import { Locale } from "i18n-config"

import LocaleSwitcher from "@/components/locale-switcher"
import { ThemeSwitch } from "@/components/theme/theme-switch"
import { authRoutes } from "@/lib/auth/constants"
import { getDictionary } from "@/lib/langs"

import ResetPasswordForm from "./form"

export default async function ForgotPassword({
  params: { lang, token },
}: {
  params: {
    lang: Locale
    token: string
  }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{dictionary.resetPasswordTitle}</h1>
      <p className="text-muted-foreground text-sm">{dictionary.resetPasswordDescription}</p>
      <ResetPasswordForm token={token} />
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
