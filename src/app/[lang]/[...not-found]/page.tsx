import Link from "next/link"
import React from "react"
import { buttonVariants } from "@/components/ui/button"
import { getDictionary } from "@/lib/langs"
import { Locale } from "i18n-config"

export default async function Page404({
  params: { lang },
}: {
  params: {
    lang: Locale
  }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <main className="container flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">{dictionary.notFound}</h1>
      <Link href="/" className={buttonVariants({ variant: "ghost" })}>
        {dictionary.home}
      </Link>
    </main>
  )
}
