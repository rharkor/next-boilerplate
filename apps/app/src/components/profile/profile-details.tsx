import { TDictionary } from "@/lib/langs"

import { ProfileDetailsDr } from "./profile-details.dr"
import UpdateAccount from "./update-account"
export default async function ProfileDetails({
  dictionary,
  hasVerifiedEmail,
}: {
  dictionary: TDictionary<typeof ProfileDetailsDr>
  hasVerifiedEmail: boolean
}) {
  return (
    <section className="mt-4 p-2 text-foreground">
      <header>
        <h3 className="text-lg font-medium">{dictionary.profilePage.profileDetails.updateAccount}</h3>
        <p className="text-sm text-muted-foreground">
          {dictionary.profilePage.profileDetails.updateAccountDescription}
        </p>
      </header>
      <UpdateAccount sessionHasVerifiedEmail={hasVerifiedEmail} dictionary={dictionary} />
    </section>
  )
}
