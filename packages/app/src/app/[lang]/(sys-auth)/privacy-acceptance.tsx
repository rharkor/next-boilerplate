import { TDictionary } from "@/lib/langs"
import { Link } from "@nextui-org/react"

export default function PrivacyAcceptance({ dictionary }: { dictionary: TDictionary }) {
  return (
    <p className="text-muted-foreground px-8 text-center text-sm">
      {dictionary.auth.clickingAggreement}{" "}
      <Link href="/terms" className="hover:text-primary inline text-sm underline underline-offset-4">
        {dictionary.auth.termsOfService}
      </Link>{" "}
      {dictionary.and}{" "}
      <Link href="/privacy" className="hover:text-primary inline text-sm underline underline-offset-4">
        {dictionary.auth.privacyPolicy}
      </Link>
      .
    </p>
  )
}
