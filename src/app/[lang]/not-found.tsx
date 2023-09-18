import Link from "next/link"
import React from "react"
import { buttonVariants } from "@/components/ui/button"

export default async function Page404MatchAll() {
  return (
    <main className="container flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">Not found</h1>
      <Link href="/" className={buttonVariants({ variant: "ghost" })}>
        Home
      </Link>
    </main>
  )
}
