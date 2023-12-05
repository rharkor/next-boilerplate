import Link from "next/link"
import { authRoutes } from "@/lib/auth/constants"
import { getDictionary } from "@/lib/langs"
import { Locale } from "i18n-config"
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
      <p className="text-sm text-muted-foreground">{dictionary.resetPasswordDescription}</p>
      <ResetPasswordForm dictionary={dictionary} token={token} />
      <Link href={authRoutes.signIn[0]} className="text-sm text-muted-foreground hover:text-primary">
        {dictionary.goToSignInPage}
      </Link>
    </main>
  )
}
