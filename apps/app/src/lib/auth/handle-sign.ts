//! Only client-side code

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { signIn } from "next-auth/react"
import { toast } from "react-toastify"
import * as z from "zod"

import { logger } from "@next-boilerplate/lib"

import { signInSchema } from "../../api/auth/schemas"
import { TDictionary } from "../langs"

export const handleSignError = (
  error: string,
  dictionary: TDictionary<{
    errors: {
      wrongProvider: true
    }
  }>
) => {
  if (error == "OAuthAccountNotLinked") {
    toast.error(dictionary.errors.wrongProvider)
  } else {
    toast(error)
  }
}

export const handleSignIn = async ({
  data,
  callbackUrl,
  router,
  dictionary,
  depth = 0,
  getOtpCode,
}: {
  data: z.infer<ReturnType<typeof signInSchema>>
  callbackUrl: string
  router: AppRouterInstance
  dictionary: TDictionary<{
    errors: {
      invalidCredentials: true
      otpInvalid: true
      wrongProvider: true
    }
    unknownError: true
  }>
  depth?: number
  getOtpCode: () => Promise<string | null>
}) => {
  return new Promise<boolean>(async (resolve, reject) => {
    logger.debug("Signing in with credentials", data)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
        otp: data.otp ?? undefined,
      })
      if (!res?.error) {
        logger.debug("Sign in successful pushing to", callbackUrl)
        router.push(callbackUrl)
        /*
        //? Refreshing the router is necessary due to next.js client cache, see: https://nextjs.org/docs/app/building-your-application/caching
        // router.refresh()
        */
        resolve(true)
      } else {
        if (res.error === "OTP_REQUIRED") {
          logger.debug("OTP_REQUIRED")
          if (depth > 0) {
            throw new Error(dictionary.unknownError)
          }
          const otp = await getOtpCode()
          if (otp === null) {
            return
          }
          const res = await handleSignIn({
            data: { ...data, otp },
            callbackUrl,
            router,
            dictionary,
            depth: depth + 1,
            getOtpCode,
          })
          resolve(res)
          return
        } else if (res.error === "OTP_INVALID") {
          throw new Error(dictionary.errors.otpInvalid)
        }
        if (typeof res.error === "string") {
          if (res.error === dictionary.errors.wrongProvider) throw new Error(res.error)
        }
        throw new Error(dictionary.errors.invalidCredentials)
      }
    } catch (error) {
      if (depth > 0) {
        reject(error)
        return
      }
      logger.error(error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(dictionary.unknownError)
      }
      reject(error)
    } finally {
      resolve(false)
    }
  })
}
