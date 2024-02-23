import { TDictionary } from "@/lib/langs"

import SessionsTable from "./sessions-table"

export default async function UserActiveSessions({ dictionary }: { dictionary: TDictionary }) {
  return (
    <section className="text-foreground p-2">
      <header>
        <h3 className="text-lg font-medium">{dictionary.profilePage.profileDetails.loggedDevices}</h3>
        <p className="text-muted-foreground text-sm">
          {dictionary.profilePage.profileDetails.loggedDevicesDescription}
        </p>
      </header>
      <SessionsTable />
    </section>
  )
}
