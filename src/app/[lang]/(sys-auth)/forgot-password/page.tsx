import { getDictionary } from "@/lib/langs"
import { Locale } from "i18n-config"
import ForgotPasswordForm from "./form"

export default async function ForgotPassword({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <main className="container flex flex-1 flex-col items-center justify-center space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{dictionary.forgotPasswordTitle}</h1>
      <p className="text-sm text-muted-foreground">{dictionary.forgotPasswordDescription}</p>
      <ForgotPasswordForm dictionary={dictionary} />
    </main>
  )
}
