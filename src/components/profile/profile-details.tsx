import UpdateAccount from "./update-account"

export default function ProfileDetails() {
  return (
    <section className="mt-4 p-2 text-foreground">
      <header>
        <h3 className="text-lg font-medium">Update your account</h3>
        <p className="text-sm text-muted-foreground">You can update your account details here.</p>
      </header>
      <UpdateAccount />
    </section>
  )
}
