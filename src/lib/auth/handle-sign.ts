//! Only client-side code

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"
import { signIn } from "next-auth/react"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { formSchema as registerFormSchema } from "@/components/auth/register-user-auth-form"
import { toast } from "@/components/ui/use-toast"
import { signInSchema, signUpSchema } from "@/types/auth"
import { logger } from "../logger"
import { handleFetch } from "../utils"

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
  return new Promise<void>(async (resolve) => {
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

export const handleSignUp = async (
  data: z.infer<typeof signUpSchema>,
  form: UseFormReturn<z.infer<typeof registerFormSchema>>,
  router: AppRouterInstance,
  loginOnSignUp = true
) => {
  logger.debug("Signing up with credentials", data)
  const request = fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const res = await handleFetch(request, (error) => {
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
  })
  if (res) {
    logger.debug("Sign up successful")
    if (loginOnSignUp) {
      logger.debug("Logging in after sign up")
      await handleSignIn({ email: data.email, password: data.password }, "/profile", router)
    } else {
      logger.debug("Pushing to profile page")
      router.push("/profile")
    }
  }
  return res
}
