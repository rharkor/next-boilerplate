import { TDictionary } from "@/lib/langs"

import UpdateAccount from "./update-account"

export default async function ProfileDetails({
  dictionary,
  hasVerifiedEmail,
}: {
  dictionary: TDictionary
  hasVerifiedEmail: boolean
}) {
  return (
    <section className="text-foreground mt-4 p-2">
      <header>
        <h3 className="text-lg font-medium">{dictionary.profilePage.profileDetails.updateAccount}</h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.profilePage.profileDetails.updateAccountDescription}
        </p>
      </header>
      <UpdateAccount sessionHasVerifiedEmail={hasVerifiedEmail} />
    </section>
  )
}
