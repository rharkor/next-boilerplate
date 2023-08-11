import UpdateAccount from "./update-account"

export default function ProfileDetails({
  dictionary,
}: {
  dictionary: {
    updateAccount: string
    updateAccountDescription: string
    username: {
      label: string
      placeholder: string
    }
    error: string
    needSavePopup: string
    reset: string
    saveChanges: string
  }
}) {
  return (
    <section className="mt-4 p-2 text-foreground">
      <header>
        <h3 className="text-lg font-medium">{dictionary.updateAccount}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.updateAccountDescription}</p>
      </header>
      <UpdateAccount dictionary={dictionary} />
    </section>
  )
}
