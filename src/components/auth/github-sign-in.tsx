"use client"

import { ClientSafeProvider, signIn } from "next-auth/react"
import { useState } from "react"
import { authRoutes } from "@/lib/auth/constants"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { Icons } from "../icons"
import { Button } from "../ui/button"
import { toast } from "../ui/use-toast"

export default function GithubSignIn({
  provider,
  dictionary,
}: {
  provider: ClientSafeProvider
  dictionary: TDictionary
}) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignIn() {
    setIsLoading(true)
    try {
      const sp = new URLSearchParams()
      sp.set("redirectOnClient", authRoutes.redirectAfterSignIn)
      // window.location.href = "?" + sp.toString()
      const res = await signIn(provider.id, {
        callbackUrl: `${window.location.origin}${authRoutes.redirectAfterSignIn}`,
      })

      if (res) {
        logger.debug("SignIn result", res)
        if (res.error) {
          if (res.error === "OAuthAccountNotLinked") {
          } else {
            throw new Error(dictionary.errors.unknownError)
          }
        }

        setIsLoading(false)
      }
      //? Do not setIsLoading(false) here because the user will be redirected to profile
    } catch (error) {
      setIsLoading(false)
      logger.error(error)
      if (error instanceof Error) {
        toast({
          title: dictionary.error,
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: dictionary.error,
          description: dictionary.errors.unknownError,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Button variant="outline" type="button" onClick={handleSignIn} disabled={isLoading}>
      {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.gitHub className="mr-2 h-4 w-4" />}
      Github
    </Button>
  )
}
