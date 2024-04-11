import Link from "next/link"

import NavSettings from "@/components/nav-settings"
import { authRoutes } from "@/constants/auth"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"

import ForgotPasswordForm from "./form"

export default async function ForgotPassword({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang, {
    forgotPasswordTitle: true,
    forgotPasswordDescription: true,
    goToSignInPage: true,
    forgotPasswordSuccessDescription: true,
    emailPlaceholder: true,
    email: true,
    errors: {
      email: true,
    },
    send: true,
    timeUntilYouCanRequestAnotherEmail: true,
  })

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center space-y-2">
      <NavSettings lang={lang} />
      <h1 className="text-2xl font-semibold tracking-tight">{dictionary.forgotPasswordTitle}</h1>
      <p className="text-sm text-muted-foreground">{dictionary.forgotPasswordDescription}</p>
      <ForgotPasswordForm dictionary={dictionary} />
      <Link href={authRoutes.signIn[0]} className="text-sm text-muted-foreground hover:text-primary">
        {dictionary.goToSignInPage}
      </Link>
    </main>
  )
}
