import { redirect } from "next/navigation"
import { RegisterUserAuthForm } from "@/components/auth/register-user-auth-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupByCredentials({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  //? If there is no email in the search params, redirect to the sign-up page
  if (!searchParams?.email) {
    redirect("/sign-up")
  }

  return (
    <main className="container relative flex flex-1 flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterUserAuthForm className="gap-3" searchParams={searchParams} />
        </CardContent>
      </Card>
    </main>
  )
}
