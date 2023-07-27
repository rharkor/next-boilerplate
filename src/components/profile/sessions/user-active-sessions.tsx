import SessionsTable from "./sessions-table"

export default function UserActiveSessions() {
  return (
    <section className="mt-4 p-2 text-foreground">
      <header>
        <h3 className="text-lg font-medium">Logged in devices</h3>
        <p className="text-sm text-muted-foreground">Manage your logged in devices here.</p>
      </header>
      <SessionsTable />
    </section>
  )
}
