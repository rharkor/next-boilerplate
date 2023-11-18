import { Button } from "@nextui-org/react"
import Link from "next/link"
import { LoginUserAuthForm } from "@/components/auth/login-user-auth-form"
import { authRoutes } from "@/lib/auth/constants"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { Locale } from "i18n-config"
import PrivacyAcceptance from "../privacy-acceptance"
import Providers from "../providers"

export default async function SignInPage({
  searchParams,
  params: { lang },
}: {
  searchParams: { [key: string]: string | string[] | undefined }
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <main className="container relative m-auto grid min-h-screen flex-1 flex-col items-center justify-center px-2 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Button
        as={Link}
        href={authRoutes.signUp[0]}
        className={cn("absolute right-4 top-4 md:right-8 md:top-8")}
        variant="ghost"
      >
        {dictionary.toSignUp}
      </Button>
      <div className="hidden h-full bg-muted lg:block"></div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{dictionary.signInPage.loginToYourAccount}</h1>
            <p className="text-sm text-muted-foreground">{dictionary.signInPage.enterDetails}</p>
          </div>
          <div className="grid gap-6">
            <LoginUserAuthForm searchParams={searchParams} dictionary={dictionary} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{dictionary.auth.orContinueWith}</span>
              </div>
            </div>
            <Providers dictionary={dictionary} searchParams={searchParams} />
          </div>
          <PrivacyAcceptance dictionary={dictionary} />
        </div>
      </div>
    </main>
  )
}
