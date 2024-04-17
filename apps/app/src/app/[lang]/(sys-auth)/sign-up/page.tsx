import Link from "next/link"
import { getServerSession } from "next-auth"

import { RegisterUserAuthForm } from "@/components/auth/register-user-auth-form"
import { RegisterUserAuthFormDr } from "@/components/auth/register-user-auth-form.dr"
import { authRoutes } from "@/constants/auth"
import { nextAuthOptions } from "@/lib/auth"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { cn } from "@/lib/utils"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { Button } from "@nextui-org/button"

import PrivacyAcceptance from "../privacy-acceptance"
import { PrivacyAcceptanceDr } from "../privacy-acceptance.dr"
import AuthProviders from "../providers"
import { AuthProvidersDr } from "../providers.dr"

export default async function SignUpPage({
  searchParams,
  params: { lang },
}: {
  searchParams: { [key: string]: string | string[] | undefined }
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements(
      {
        login: true,
        signUpPage: {
          createAnAccount: true,
          enterEmail: true,
        },
        auth: {
          orContinueWith: true,
        },
      },
      AuthProvidersDr,
      PrivacyAcceptanceDr,
      RegisterUserAuthFormDr
    )
  )
  const session = await getServerSession(nextAuthOptions)

  return (
    <main className="container relative m-auto grid min-h-screen flex-1 flex-col items-center justify-center px-2 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Button
        as={Link}
        href={authRoutes.signIn[0]}
        className={cn("absolute right-4 top-4 md:right-8 md:top-8")}
        variant="ghost"
      >
        {dictionary.login}
      </Button>
      <div className="hidden h-full bg-muted lg:block"></div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{dictionary.signUpPage.createAnAccount}</h1>
            <p className="text-sm text-muted-foreground">{dictionary.signUpPage.enterEmail}</p>
          </div>
          <div className="grid gap-6">
            <RegisterUserAuthForm dictionary={dictionary} isMinimized searchParams={searchParams} locale={lang} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{dictionary.auth.orContinueWith}</span>
              </div>
            </div>
            <AuthProviders dictionary={dictionary} searchParams={searchParams} session={session} />
          </div>
          <PrivacyAcceptance dictionary={dictionary} />
        </div>
      </div>
    </main>
  )
}
