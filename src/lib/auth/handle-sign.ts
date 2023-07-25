//! Only client-side code

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"
import { signIn } from "next-auth/react"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { formSchema as registerFormSchema } from "@/components/auth/register-user-auth-form"
import { toast } from "@/components/ui/use-toast"
import { IApiState } from "@/contexts/api.store"
import { signInSchema, signUpSchema } from "@/types/auth"
import { logger } from "../logger"

export const handleSignError = (error: string) => {
  if (error == "OAuthAccountNotLinked") {
    toast({
      title: "Error",
      description: "You already have an account. Please sign in with your provider.",
      variant: "destructive",
    })
  } else {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    })
  }
}

export const handleSignIn = async (
  data: z.infer<typeof signInSchema>,
  callbackUrl: string,
  router: AppRouterInstance
) => {
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
        //! Push with next/router doesn't work
        //? When the user come from a basic route the click to a protected route and get
        //? redirected here, the router.push doesn't work because the response is cached
        //? and the user is infinitely redirected to the login page
        // router.push(callbackUrl)
        router.replace(callbackUrl)
        resolve(true)
      } else {
        console.error(res.error)
        if (typeof res.error === "string") {
          if (res.error === "You signed up with a provider, please sign in with it") throw new Error(res.error)
        }
        throw new Error("Invalid credentials. Please try again.")
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
  loginOnSignUp = true,
}: {
  data: z.infer<typeof signUpSchema>
  form: UseFormReturn<z.infer<typeof registerFormSchema>>
  router: AppRouterInstance
  loginOnSignUp: boolean
  apiFetch: ReturnType<IApiState["apiFetch"]>
}) => {
  return new Promise<void | boolean>(async (resolve) => {
    logger.debug("Signing up with credentials", data)
    const res = await apiFetch(
      fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
      {
        onError: (error) => {
          if (error === "Email already exists") {
            return form.setError("email", {
              type: "manual",
              message: "Email already exists",
            })
          } else if (error === "Username already exists") {
            return form.setError("username", {
              type: "manual",
              message: "Username already exists",
            })
          }
          toast({
            title: "Error",
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
        return handleSignIn({ email: data.email, password: data.password }, "/profile", router)
      } else {
        logger.debug("Pushing to profile page")
        router.push("/profile")
        resolve(true)
      }
    }
    resolve()
  })
}
