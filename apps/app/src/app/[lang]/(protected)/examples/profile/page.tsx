import DeleteAccountButton from "@/components/auth/delete-account-button"
import { DeleteAccountButtonDr } from "@/components/auth/delete-account-button.dr"
import SignoutButton from "@/components/auth/sign-out-button"
import VerifyEmailButton from "@/components/auth/verify-email-button"
import { VerifyEmailButtonDr } from "@/components/auth/verify-email-button.dr"
import ProfileDetails from "@/components/profile/profile-details"
import { ProfileDetailsDr } from "@/components/profile/profile-details.dr"
import UserActiveSessions from "@/components/profile/sessions/user-active-sessions"
import { UserActiveSessionsDr } from "@/components/profile/sessions/user-active-sessions.dr"
import CardTitle from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/langs"
import { dictionaryRequirements } from "@/lib/utils/dictionary"
import { Card, CardBody, CardHeader } from "@nextui-org/card"

export default async function Profile({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(
    lang,
    dictionaryRequirements(
      {
        profile: true,
        profilePage: {
          serverSideData: true,
        },
        deleteAccount: true,
        signOut: true,
      },
      UserActiveSessionsDr,
      DeleteAccountButtonDr,
      VerifyEmailButtonDr,
      ProfileDetailsDr
    )
  )
  const session = await auth()

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
            <pre className="mt-2 w-[40rem] max-w-full overflow-auto rounded bg-muted p-2">
              {JSON.stringify(session, null, 2)}
            </pre>
            <div className="mt-4 flex flex-col items-center space-y-2 md:mr-0 md:w-full md:flex-row md:justify-end md:space-x-2 md:space-y-0">
              {session && <VerifyEmailButton session={session} dictionary={dictionary} />}
              <DeleteAccountButton dictionary={dictionary}>{dictionary.deleteAccount}</DeleteAccountButton>
              <SignoutButton>{dictionary.signOut}</SignoutButton>
            </div>
            <ProfileDetails dictionary={dictionary} hasVerifiedEmail={hasVerifiedEmail} />
            <UserActiveSessions dictionary={dictionary} />
          </CardBody>
        </Card>
      </div>
    </main>
  )
}
