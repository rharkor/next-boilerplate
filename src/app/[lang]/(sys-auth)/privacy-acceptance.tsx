import Link from "next/link"
import { TDictionary } from "@/lib/langs"

export default function PrivacyAcceptance({ dictionary }: { dictionary: TDictionary }) {
  return (
    <p className="px-8 text-center text-sm text-muted-foreground">
      {dictionary.auth.clickingAggreement}{" "}
      <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
        {dictionary.auth.termsOfService}
      </Link>{" "}
      {dictionary.and}{" "}
      <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
        {dictionary.auth.privacyPolicy}
      </Link>
      .
    </p>
  )
}
