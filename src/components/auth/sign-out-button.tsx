"use client"

import { signOut } from "next-auth/react"
import { Button } from "../ui/button"

export default function SignoutButton({ children }: { children: React.ReactNode }) {
  return (
    <Button variant="ghost" onClick={() => signOut()}>
      {children}
    </Button>
  )
}
