import { getServerSession } from "next-auth"
import { Locale } from "i18n-config"

import DeleteAccountButton from "@/components/auth/delete-account-button"
import SignoutButton from "@/components/auth/sign-out-button"
import VerifyEmailButton from "@/components/auth/verify-email-button"
import ProfileDetails from "@/components/profile/profile-details"
import UserActiveSessions from "@/components/profile/sessions/user-active-sessions"
import CardTitle from "@/components/ui/card"
import { nextAuthOptions } from "@/lib/auth"
import { getDictionary } from "@/lib/langs"
import { Card, CardBody, CardHeader } from "@nextui-org/react"

export default async function Profile({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)
  const session = await getServerSession(nextAuthOptions)

  const hasVerifiedEmail = Boolean(session?.user.emailVerified)

  return (
    <main className="container m-auto flex flex-1 flex-col items-center justify-center p-6 pb-20">
      <div className="flex w-full max-w-max flex-col">
        <Card className="relative z-10 m-auto max-w-full">
          <CardHeader>
            <CardTitle>{dictionary.profile}</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-muted-foreground">{dictionary.profilePage.serverSideData}</p>
            <pre className="bg-muted mt-2 w-[40rem] max-w-full overflow-auto rounded p-2">
              {JSON.stringify(session, null, 2)}
            </pre>
            <div className="mt-4 flex flex-col items-center space-y-2 md:mr-0 md:w-full md:flex-row md:justify-end md:space-x-2 md:space-y-0">
              {session && <VerifyEmailButton session={session} />}
              <DeleteAccountButton>{dictionary.deleteAccount}</DeleteAccountButton>
              <SignoutButton>{dictionary.signOut}</SignoutButton>
            </div>
            <ProfileDetails dictionary={dictionary} hasVerifiedEmail={hasVerifiedEmail} />
            <UserActiveSessions dictionary={dictionary} session={session} />
          </CardBody>
        </Card>
      </div>
    </main>
  )
}
