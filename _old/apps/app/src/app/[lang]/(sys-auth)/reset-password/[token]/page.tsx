import Link from "next/link"

import NavSettings from "@/components/nav-settings"
import { authRoutes } from "@/constants/auth"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import ResetPasswordForm from "./form"
import { ResetPasswordFormDr } from "./form.dr"

export default async function ForgotPassword({
  params: { lang, token },
}: {
  params: {
    lang: Locale
    token: string
  }
}) {
  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements(
      {
        resetPasswordTitle: true,
        resetPasswordDescription: true,
        goToSignInPage: true,
      },
      ResetPasswordFormDr
    )
  )

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center space-y-2">
      <NavSettings lang={lang} />
      <h1 className="text-2xl font-semibold tracking-tight">{dictionary.resetPasswordTitle}</h1>
      <p className="text-sm text-muted-foreground">{dictionary.resetPasswordDescription}</p>
      <ResetPasswordForm dictionary={dictionary} token={token} />
      <Link href={authRoutes.signIn[0]} className="text-sm text-muted-foreground hover:text-primary">
        {dictionary.goToSignInPage}
      </Link>
    </main>
  )
}
