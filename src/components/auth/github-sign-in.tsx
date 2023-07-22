"use client"

import { ClientSafeProvider, signIn } from "next-auth/react"
import { useState } from "react"
import { logger } from "@/lib/logger"
import { Icons } from "../icons"
import { Button } from "../ui/button"
import { toast } from "../ui/use-toast"

export default function GithubSignIn({ provider }: { provider: ClientSafeProvider }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignIn() {
    setIsLoading(true)
    try {
      const res = await signIn(provider.id, {
        callbackUrl: `${window.location.origin}/profile`,
      })
      console.log(res)

      if (!res?.error) {
        // router.push(callbackUrl)
        console.log("success")
      } else {
        if (res?.error === "OAuthAccountNotLinked") {
        } else {
          throw new Error("Invalid credentials. Please try again.")
        }
      }
    } catch (error) {
      logger.error(error)
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "An unknown error occurred",
          variant: "destructive",
        })
      }
    }
    setIsLoading(false)
  }

  return (
    <Button variant="outline" type="button" onClick={handleSignIn} disabled={isLoading}>
      {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.gitHub className="mr-2 h-4 w-4" />}
      Github
    </Button>
  )
}
