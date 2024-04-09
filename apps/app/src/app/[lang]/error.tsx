"use client"

import React from "react"

import { useDictionary } from "@/contexts/dictionary/utils"
import { Button } from "@nextui-org/react"

export default function ErrorPage({ reset }: { reset: () => void }) {
  const dictionary = useDictionary({
    somethingWentWrong: true,
    tryAgain: true,
  })
  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">{dictionary.somethingWentWrong()}</h1>
      <Button onPress={reset} color="primary" variant="flat">
        {dictionary.tryAgain()}
      </Button>
    </main>
  )
}
