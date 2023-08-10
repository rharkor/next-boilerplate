import SessionsTable from "./sessions-table"

export default function UserActiveSessions({
  dictionary,
}: {
  dictionary: {
    loggedDevices: string
    loggedDevicesDescription: string
    sessionTable: {
      areYouAbsolutelySure: string
      deleteLoggedDevice: {
        description: string
      }
      cancel: string
      continue: string
    }
  }
}) {
  return (
    <section className="p-2 text-foreground">
      <header>
        <h3 className="text-lg font-medium">{dictionary.loggedDevices}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.loggedDevicesDescription}</p>
      </header>
      <SessionsTable dictionary={dictionary.sessionTable} />
    </section>
  )
}
