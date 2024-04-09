import { TDictionary } from "@/lib/langs"
import { Link } from "@nextui-org/react"

export default function PrivacyAcceptance({
  dictionary,
}: {
  dictionary: {
    auth: {
      clickingAggreement: TDictionary["auth"]["clickingAggreement"]
      termsOfService: TDictionary["auth"]["termsOfService"]
      privacyPolicy: TDictionary["auth"]["privacyPolicy"]
    }
    and: TDictionary["and"]
  }
}) {
  return (
    <p className="px-8 text-center text-sm text-muted-foreground">
      {dictionary.auth.clickingAggreement()}{" "}
      <Link href="/terms" className="inline text-sm underline underline-offset-4 hover:text-primary">
        {dictionary.auth.termsOfService()}
      </Link>{" "}
      {dictionary.and()}{" "}
      <Link href="/privacy" className="inline text-sm underline underline-offset-4 hover:text-primary">
        {dictionary.auth.privacyPolicy()}
      </Link>
      .
    </p>
  )
}
