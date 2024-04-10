"use client"

import { Button } from "@nextui-org/react"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">Error something went wrong</h1>
      <Button onPress={reset} color="primary" variant="flat">
        Try again
      </Button>
    </main>
  )
}
