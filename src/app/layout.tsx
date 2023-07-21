import { Metadata } from "next"
import React from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Next.js",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  )
}
