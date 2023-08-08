"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useApiStore } from "@/contexts/api.store"
import { authRoutes } from "@/lib/auth/constants"
import { handleSignError, handleSignUp } from "@/lib/auth/handle-sign"
import { cn } from "@/lib/utils"
import { signUpSchema } from "@/types/auth"
import { Button, buttonVariants } from "../ui/button"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"
import { Label } from "../ui/label"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  isMinimized?: boolean
  searchParams?: { [key: string]: string | string[] | undefined }
}

export const formSchema = signUpSchema
  .extend({
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmPassword"],
        fatal: true,
      })
    }
  })

export const formMinizedSchema = signUpSchema.pick({
  email: true,
})

export const getFormSchema = (isMinimized?: boolean) => (isMinimized ? formMinizedSchema : formSchema)

export type IForm = z.infer<typeof formSchema>
export type IFormMinimized = z.infer<typeof formMinizedSchema>

export function RegisterUserAuthForm({ isMinimized, searchParams, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const apiFetch = useApiStore((state) => state.apiFetch(router))

  const emailFromSearchParam = searchParams?.email?.toString()
  const error = searchParams?.error?.toString()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [emailSettedBySearchParam, setEmailSettedBySearchParam] = React.useState<string | undefined>(
    searchParams?.email?.toString()
  )

  const [errorDisplayed, setErrorDisplayed] = React.useState<string | null>(null)

  const form = useForm<IForm>({
    resolver: zodResolver(getFormSchema(isMinimized)),
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
    handleSignError(error)
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
    const isPushingRoute = await handleSignUp({ data, form, router, loginOnSignUp: true, apiFetch })
    //? If isPushingRoute is true, it means that the user is being redirected to the callbackUrl
    if (!isPushingRoute) setIsLoading(false)
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
            Email
          </Label>
          <div className="relative">
            <FormField
              placeholder="name@example.com"
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
                Edit
              </Link>
            )}
          </div>
        </div>
        {!isMinimized && (
          <>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="username">
                Username
              </Label>
              <FormField
                placeholder="Username"
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
                Password
              </Label>
              <FormField
                placeholder="Password"
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
                Confirm Password
              </Label>
              <FormField
                placeholder="Confirm Password"
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
          Sign Up {isMinimized && "With Email"}
        </Button>
      </form>
    </Form>
  )
}
