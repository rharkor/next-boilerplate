import Link from "next/link"

import NavSettings from "@/components/nav-settings"
import { authRoutes } from "@/constants/auth"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"

import VerifyEmailButton from "./form"

export default async function VerifyEmail({
  params: { lang, token },
}: {
  params: {
    lang: Locale
    token: string
  }
}) {
  const dictionary = await getDictionary(lang, {
    emailVerificationTitle: true,
    emailVerificationDescription: true,
    verifyEmail: true,
    verifyEmailSuccessDescription: true,
    goToSignInPage: true,
  })

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center space-y-2">
      <NavSettings lang={lang} />
      <h1 className="text-2xl font-semibold tracking-tight">{dictionary.emailVerificationTitle}</h1>
      <p className="text-sm text-muted-foreground">{dictionary.emailVerificationDescription}</p>
      <VerifyEmailButton token={token} dictionary={dictionary} />
      <Link href={authRoutes.signIn[0]} className="text-sm text-muted-foreground hover:text-primary">
        {dictionary.goToSignInPage}
      </Link>
    </main>
  )
}
