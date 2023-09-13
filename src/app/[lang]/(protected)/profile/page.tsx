import { getServerSession } from "next-auth"
import DeleteAccountButton from "@/components/auth/delete-account-button"
import SignoutButton from "@/components/auth/sign-out-button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { nextAuthOptions } from "@/lib/auth"
import { getDictionary } from "@/lib/langs"
import { Locale } from "i18n-config"
import SeeDetailsToggle from "./see-details-toggle"

export default async function Profile({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)
  const session = await getServerSession(nextAuthOptions)

  return (
    <main className="container flex flex-1 flex-col items-center justify-center p-6">
      <div>
        <Card className="relative z-10 m-auto max-w-full">
          <CardHeader>
            <CardTitle>{dictionary.profile}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{dictionary.profilePage.serverSideData}</p>
            <pre className="mt-2 overflow-auto rounded bg-muted p-2">{JSON.stringify(session, null, 2)}</pre>
          </CardContent>
          <CardFooter>
            <div className="ml-auto flex flex-row space-x-2">
              <DeleteAccountButton dictionary={dictionary}>{dictionary.deleteAccount}</DeleteAccountButton>
              <SignoutButton>{dictionary.signOut}</SignoutButton>
            </div>
          </CardFooter>
        </Card>
        <SeeDetailsToggle dictionary={dictionary} />
      </div>
    </main>
  )
}
