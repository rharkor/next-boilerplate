"use client"

import { redirect } from "next/navigation"
import { Session } from "next-auth"
import { signIn } from "next-auth/react"
import { toast } from "react-toastify"

import GithubSignIn from "@/components/auth/github-sign-in"
import { authRoutes } from "@/constants/auth"
import { useDictionary } from "@/contexts/dictionary/utils"
import { logger } from "@next-boilerplate/lib/logger"

export default function Providers({
  searchParams,
  session,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
  session: Session | null
}) {
  const dictionary = useDictionary()
  const callbackUrl = searchParams.callbackUrl ? searchParams.callbackUrl.toString() : undefined

  //? If session and callbackUrl, redirect to callbackUrl
  if (session && callbackUrl) {
    redirect(callbackUrl)
  }

  async function handleSignIn({ providerId }: { providerId: string }): Promise<boolean> {
    try {
      const res = await signIn(providerId, {
        callbackUrl: `${window.location.origin}${authRoutes.redirectAfterSignIn}`,
      })

      if (res) {
        logger.debug("SignIn result", res)
        if (res.error) {
          if (res.error === "OAuthAccountNotLinked") {
            toast.error(dictionary.errors.wrongProvider)
          } else {
            throw new Error(dictionary.errors.unknownError)
          }
        }
      }
      return true
      //? Do not setIsLoading(false) here because the user will be redirected to profile
    } catch (error) {
      logger.error(error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast(dictionary.errors.unknownError)
      }
      return false
    }
  }

  return (
    <>
      <GithubSignIn providerId={"github"} handleSignIn={handleSignIn} />
    </>
  )
}
