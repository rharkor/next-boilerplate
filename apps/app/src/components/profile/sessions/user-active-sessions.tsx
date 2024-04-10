import { TDictionary } from "@/lib/langs"

import SessionsTable from "./sessions-table"
import { UserActiveSessionsDr } from "./user-active-sessions.dr"

export default async function UserActiveSessions({
  dictionary,
}: {
  dictionary: TDictionary<typeof UserActiveSessionsDr>
}) {
  return (
    <section className="p-2 text-foreground">
      <header>
        <h3 className="text-lg font-medium">{dictionary.profilePage.profileDetails.loggedDevices}</h3>
        <p className="text-sm text-muted-foreground">
          {dictionary.profilePage.profileDetails.loggedDevicesDescription}
        </p>
      </header>
      <SessionsTable dictionary={dictionary} />
    </section>
  )
}
