import React from "react"
import { cookies } from "next/headers"
import { Locale } from "i18n-config"

import { getDictionary } from "@/lib/langs"
import { Button, Link } from "@nextui-org/react"

export default async function Page404MatchAll() {
  const cookiesStore = cookies()
  const savedLocale = cookiesStore.get("saved-locale")
  const params = savedLocale?.value ? { lang: savedLocale.value } : undefined
  const dictionary = await getDictionary(params ? (params.lang as Locale) : "en")
  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">{dictionary.notFound}</h1>
      <Button as={Link} href="/" color="primary" variant="flat">
        {dictionary.goHome}
      </Button>
    </main>
  )
}
