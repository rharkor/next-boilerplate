import Link from "next/link"
import { redirect } from "next/navigation"
import { Locale } from "i18n-config"
import { ChevronRight } from "lucide-react"

import { RegisterUserAuthForm } from "@/components/auth/register-user-auth-form"
import CardTitle from "@/components/ui/card"
import { authRoutes } from "@/lib/auth/constants"
import { getDictionary } from "@/lib/langs"
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react"

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
    <main className="container relative m-auto flex min-h-screen flex-1 flex-col items-center justify-center px-2 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link href={{ pathname: authRoutes.signUp[0], query: { email: searchParams.email } }}>
        <Button className="absolute left-2 top-2 min-w-0 p-2" size={"sm"}>
          <ChevronRight className="size-4 rotate-180" />
        </Button>
      </Link>
      <Card className="w-[500px] max-w-full">
        <CardHeader>
          <CardTitle>{dictionary.signUpPage.createAnAccount}</CardTitle>
        </CardHeader>
        <CardBody>
          <RegisterUserAuthForm className="gap-3" searchParams={searchParams} locale={lang} />
        </CardBody>
      </Card>
    </main>
  )
}
