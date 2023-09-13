"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { authRoutes } from "@/lib/auth/constants"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { handleMutationError } from "@/lib/client-utils"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { signUpSchema } from "@/lib/schemas/auth"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "../ui/button"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"
import { Label } from "../ui/label"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  dictionary: TDictionary
  isMinimized?: boolean
  searchParams?: { [key: string]: string | string[] | undefined }
}

export const formSchema = (dictionary: TDictionary) =>
  signUpSchema(dictionary)
    .extend({
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: dictionary.errors.password.dontMatch,
          path: ["confirmPassword"],
          fatal: true,
        })
      }
    })

export const formMinizedSchema = (dictionary: TDictionary) =>
  signUpSchema(dictionary).pick({
    email: true,
  })

export const getFormSchema = ({ dictionary, isMinimized }: { dictionary: TDictionary; isMinimized?: boolean }) =>
  isMinimized ? formMinizedSchema(dictionary) : formSchema(dictionary)

export type IForm = z.infer<ReturnType<typeof formSchema>>
export type IFormMinimized = z.infer<ReturnType<typeof formMinizedSchema>>

export function RegisterUserAuthForm({ dictionary, isMinimized, searchParams, ...props }: UserAuthFormProps) {
  const router = useRouter()

  const registerMutation = trpc.auth.register.useMutation({
    onError: (error) => {
      const translatedError = handleMutationError(error, dictionary, router)
      if (error.message.includes("email")) {
        return form.setError("email", {
          type: "manual",
          message: translatedError.message,
        })
      } else if (error.message.includes("username")) {
        return form.setError("username", {
          type: "manual",
          message: translatedError.message,
        })
      }
      setIsLoading(false)
    },
    onSuccess: (_, vars) => {
      logger.debug("Sign up successful")
      handleSignIn({
        data: { email: vars.email, password: vars.password },
        callbackUrl: authRoutes.redirectAfterSignIn,
        router,
        dictionary,
      }).catch((error) => {
        logger.error("Error while signing in after sign up", error)
        setIsLoading(false)
      })
    },
  })

  const emailFromSearchParam = searchParams?.email?.toString()
  const error = searchParams?.error?.toString()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [emailSettedBySearchParam, setEmailSettedBySearchParam] = React.useState<string | undefined>(
    searchParams?.email?.toString()
  )

  const [errorDisplayed, setErrorDisplayed] = React.useState<string | null>(null)

  const form = useForm<IForm>({
    resolver: zodResolver(getFormSchema({ isMinimized, dictionary })),
    defaultValues: {
      email: emailFromSearchParam || "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  //? If the emailSettedBySearchParam is not the same as the email value, and different from the previous value, set the email value
  if (
    emailFromSearchParam &&
    emailFromSearchParam !== emailSettedBySearchParam &&
    emailFromSearchParam !== form.getValues("email")
  ) {
    form.setValue("email", emailFromSearchParam)
    setEmailSettedBySearchParam(emailFromSearchParam)
  }

  if (error && (!errorDisplayed || errorDisplayed !== error)) {
    setErrorDisplayed(error)
    handleSignError(error, dictionary)
  }

  async function onSubmitMinimized(data: IFormMinimized) {
    if (isMinimized) {
      setIsLoading(true)
      const searchParams = new URLSearchParams()
      searchParams.set("email", data.email)
      return router.push("/sign-up/credentials?" + searchParams.toString())
    }
  }

  async function onSubmit(data: IForm) {
    setIsLoading(true)
    logger.debug("Signing up with credentials", data)
    registerMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(isMinimized ? onSubmitMinimized : onSubmit)}
        {...props}
        className={cn("grid gap-2", props.className)}
      >
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="email">
            {dictionary.email}
          </Label>
          <div className="relative">
            <FormField
              placeholder={dictionary.emailPlaceholder}
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || !isMinimized}
              form={form}
              name="email"
              className={cn({
                "pointer-events-none": !isMinimized,
              })}
            />
            {!isMinimized && (
              <Link
                className={cn(
                  "absolute inset-y-0 right-0 flex items-center text-primary",
                  buttonVariants({
                    variant: "ghost",
                  })
                )}
                href={{ pathname: authRoutes.signUp[0], query: { email: form.getValues("email") } }}
                passHref
              >
                {dictionary.edit}
              </Link>
            )}
          </div>
        </div>
        {!isMinimized && (
          <>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="username">
                {dictionary.username}
              </Label>
              <FormField
                placeholder={dictionary.usernamePlaceholder}
                type="text"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect="off"
                disabled={isLoading}
                form={form}
                name="username"
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                {dictionary.password}
              </Label>
              <FormField
                placeholder={dictionary.passwordPlaceholder}
                type="password-eye-slash"
                autoComplete="new-password"
                autoCorrect="off"
                disabled={isLoading}
                form={form}
                name="password"
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="confirmPassword">
                {dictionary.confirmPassword}
              </Label>
              <FormField
                placeholder={dictionary.confirmPasswordPlaceholder}
                type="password"
                autoComplete="new-password"
                autoCorrect="off"
                disabled={isLoading}
                form={form}
                name="confirmPassword"
              />
            </div>
          </>
        )}
        <Button type="submit" isLoading={isLoading}>
          {dictionary.signUp} {isMinimized && dictionary.withEmail}
        </Button>
      </form>
    </Form>
  )
}
