import Link from "next/link"
import { Locale } from "i18n-config"

import NavSettings from "@/components/nav-settings"
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
      <NavSettings lang={lang} />
      <h1 className="text-2xl font-semibold tracking-tight">{dictionary.recover2FA}</h1>
      <Recover2FAForm email={email} />
      <Link href={authRoutes.signIn[0]} className="text-muted-foreground hover:text-primary text-sm">
        {dictionary.goToSignInPage}
      </Link>
    </main>
  )
}
