import React from "react"
import Link from "next/link"

export default async function Page404MatchAll() {
  return (
    <main className="container m-auto flex min-h-screen flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">Not found</h1>
      <Link href="/" className="hover:text-blue-500">
        Home
      </Link>
    </main>
  )
}
