import Link from "next/link"

import NavSettings from "@/components/nav-settings"
import { authRoutes } from "@/constants/auth"
import { getDictionary } from "@/contexts/dictionary/server-utils"
import { Locale } from "@/lib/i18n-config"

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
  const dictionary = await getDictionary(lang, {
    recover2FA: true,
    goToSignInPage: true,
  })
  const email = searchParams.email as string | undefined

  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center space-y-2">
      <NavSettings lang={lang} />
      <h1 className="text-2xl font-semibold tracking-tight">{dictionary.recover2FA()}</h1>
      <Recover2FAForm email={email} />
      <Link href={authRoutes.signIn[0]} className="text-sm text-muted-foreground hover:text-primary">
        {dictionary.goToSignInPage()}
      </Link>
    </main>
  )
}
