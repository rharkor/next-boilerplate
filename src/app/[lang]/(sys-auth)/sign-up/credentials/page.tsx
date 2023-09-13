import { redirect } from "next/navigation"
import { RegisterUserAuthForm } from "@/components/auth/register-user-auth-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authRoutes } from "@/lib/auth/constants"
import { getDictionary } from "@/lib/langs"
import { Locale } from "i18n-config"

export default async function SignupByCredentials({
  searchParams,
  params: { lang },
}: {
  searchParams: { [key: string]: string | string[] | undefined }
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)

  //? If there is no email in the search params, redirect to the sign-up page
  if (!searchParams.email) {
    redirect(authRoutes.signUp[0])
  }

  return (
    <main className="container relative flex flex-1 flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>{dictionary.signUpPage.createAnAccount}</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterUserAuthForm className="gap-3" searchParams={searchParams} dictionary={dictionary} />
        </CardContent>
      </Card>
    </main>
  )
}
