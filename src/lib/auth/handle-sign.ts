//! Only client-side code

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"
import { signIn } from "next-auth/react"
import * as z from "zod"
import { toast } from "@/components/ui/use-toast"
import { TDictionary } from "../langs"
import { logger } from "../logger"
import { signInSchema } from "../schemas/auth"

export const handleSignError = (error: string, dictionary: TDictionary) => {
  if (error == "OAuthAccountNotLinked") {
    toast({
      title: dictionary.error,
      description: dictionary.errors.wrongProvider,
      variant: "destructive",
    })
  } else {
    toast({
      title: dictionary.error,
      description: error,
      variant: "destructive",
    })
  }
}

export const handleSignIn = async ({
  data,
  callbackUrl,
  router,
  dictionary,
}: {
  data: z.infer<ReturnType<typeof signInSchema>>
  callbackUrl: string
  router: AppRouterInstance
  dictionary: TDictionary
}) => {
  return new Promise<void | boolean>(async (resolve, reject) => {
    logger.debug("Signing in with credentials", data)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      })
      if (!res?.error) {
        logger.debug("Sign in successful pushing to", callbackUrl)
        router.push(callbackUrl)
        //? Refreshing the router is necessary due to next.js client cache, see: https://nextjs.org/docs/app/building-your-application/caching
        router.refresh()
        resolve(true)
      } else {
        console.error(res.error)
        if (typeof res.error === "string") {
          if (res.error === dictionary.errors.wrongProvider) throw new Error(res.error)
        }
        throw new Error(dictionary.errors.invalidCredentials)
      }
    } catch (error) {
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
      reject(error)
    } finally {
      resolve()
    }
  })
}
