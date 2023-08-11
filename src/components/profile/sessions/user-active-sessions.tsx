import { TDictionary } from "@/lib/langs"
import SessionsTable from "./sessions-table"

/*
...dictionary.profilePage.profileDetails,
                sessionTable: {
                  areYouAbsolutelySure: dictionary.areYouAbsolutelySure,
                  cancel: dictionary.cancel,
                  continue: dictionary.continue,
                  deleteLoggedDevice: dictionary.profilePage.profileDetails.deleteLoggedDevice,
                  session: dictionary.profilePage.profileDetails.session,
                  sessions: dictionary.profilePage.profileDetails.sessions,
                  error: dictionary.error,
                  delete: dictionary.delete,
                  fetch: dictionary.fetch,
                  couldNotMessage: dictionary.couldNotMessage,
                },
              }}
*/

export default function UserActiveSessions({ dictionary }: { dictionary: TDictionary }) {
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
