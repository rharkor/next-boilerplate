"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { handleSignError } from "@/lib/auth/handle-sign-errors"
import { cn, handleFetch } from "@/lib/utils"
import { signUpSchema } from "@/types/auth"
import { Button, buttonVariants } from "../ui/button"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"
import { Label } from "../ui/label"
import { toast } from "../ui/use-toast"

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

  const emailFromSearchParam = searchParams?.email?.toString()
  const error = searchParams?.error?.toString()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [emailSettedBySearchParam, setEmailSettedBySearchParam] = React.useState<string | undefined>(
    searchParams?.email?.toString()
  )

  const [errorDisplayed, setErrorDisplayed] = React.useState<string | null>(null)

  const form = useForm<IForm | IFormMinimized>({
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

  async function onSubmit(data: IForm | IFormMinimized) {
    if (isMinimized) {
      const searchParams = new URLSearchParams()
      searchParams.set("email", data.email)
      return router.push("/sign-up/credentials?" + searchParams.toString())
    }
    //? Verify if data is IForm
    if (!("username" in data)) {
      return
    }
    setIsLoading(true)
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
      router.push("/profile")
    }
    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props} className={cn("grid gap-2", props.className)}>
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
              className={cn(!isMinimized && "pointer-events-none")}
            />
            {!isMinimized && (
              <Link
                className={cn(
                  "absolute inset-y-0 right-0 flex items-center text-primary",
                  buttonVariants({
                    variant: "ghost",
                  })
                )}
                href={{ pathname: "/sign-up", query: { email: form.getValues("email") } }}
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
