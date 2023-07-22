"use client"

import { ClientSafeProvider, signIn } from "next-auth/react"
import { Icons } from "../icons"
import { Button } from "../ui/button"

export default function GithubSignIn({ provider }: { provider: ClientSafeProvider }) {
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() =>
        signIn(provider.id, {
          callbackUrl: `${window.location.origin}/profile`,
        })
      }
    >
      <Icons.gitHub className="mr-2 h-4 w-4" />
      Github
    </Button>
  )
}
