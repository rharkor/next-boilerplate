import { ReactNode } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Next.js boilerplate",
  description: "Welcome to Next.js boilerplate",
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return children
}
