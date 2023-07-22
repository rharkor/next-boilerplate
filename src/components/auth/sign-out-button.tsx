"use client"

import { signOut } from "next-auth/react"
import { Button } from "../ui/button"

export default function SignoutButton() {
  return (
    <Button variant="ghost" onClick={() => signOut()}>
      Sign Out
    </Button>
  )
}
