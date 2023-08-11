//! Only client-side code

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"
import { signIn } from "next-auth/react"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { formSchema as registerFormSchema } from "@/components/auth/register-user-auth-form"
import { toast } from "@/components/ui/use-toast"
import { IApiState } from "@/contexts/api.store"
import { signInSchema, signUpSchema } from "@/types/auth"
import { TDictionary } from "../langs"
import { logger } from "../logger"

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
  return new Promise<void | boolean>(async (resolve) => {
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
    } finally {
      resolve()
    }
  })
}

export const handleSignUp = async ({
  data,
  form,
  router,
  apiFetch,
  dictionary,
  loginOnSignUp = true,
}: {
  data: z.infer<ReturnType<typeof signUpSchema>>
  form: UseFormReturn<z.infer<ReturnType<typeof registerFormSchema>>>
  router: AppRouterInstance
  apiFetch: ReturnType<IApiState["apiFetch"]>
  dictionary: TDictionary
  loginOnSignUp: boolean
}) => {
  return new Promise<void | boolean>(async (resolve) => {
    logger.debug("Signing up with credentials", data)
    const res = await apiFetch(
      fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      dictionary,
      {
        onError: (error) => {
          if (error === "Email already exists") {
            return form.setError("email", {
              type: "manual",
              message: dictionary.errors.email.exist,
            })
          } else if (error === "Username already exists") {
            return form.setError("username", {
              type: "manual",
              message: dictionary.errors.username.exist,
            })
          }
          toast({
            title: dictionary.error,
            description: error,
            variant: "destructive",
          })
        },
      }
    )
    if (res) {
      logger.debug("Sign up successful")
      if (loginOnSignUp) {
        logger.debug("Logging in after sign up")
        return handleSignIn({
          data: { email: data.email, password: data.password },
          callbackUrl: "/profile",
          router,
          dictionary,
        })
      } else {
        logger.debug("Pushing to profile page")
        router.push("/profile")
        //? Refreshing the router is necessary due to next.js client cache, see: https://nextjs.org/docs/app/building-your-application/caching
        router.refresh()
        resolve(true)
      }
    }
    resolve()
  })
}
