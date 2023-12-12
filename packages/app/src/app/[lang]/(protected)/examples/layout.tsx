import { Metadata } from "next"
import { notFound } from "next/navigation"
import { env } from "env.mjs"

export const metadata: Metadata = {
  title: "Examples",
}

export default function ExamplesLayout({ children }: { children: React.ReactNode }) {
  if (env.ENV !== "development" && !env.NEXT_PUBLIC_IS_DEMO) {
    notFound()
  }

  return <>{children}</>
}
