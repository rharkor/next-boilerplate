"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { cn } from "@/lib/utils"
import { signInSchema } from "@/types/auth"
import { Button } from "../ui/button"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"
import { Label } from "../ui/label"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  searchParams: { [key: string]: string | string[] | undefined }
}

export const formSchema = signInSchema

export type IForm = z.infer<typeof formSchema>

export function LoginUserAuthForm({ searchParams, ...props }: UserAuthFormProps) {
  const router = useRouter()

  const callbackUrl = searchParams?.callbackUrl?.toString() || "/profile"
  const error = searchParams?.error?.toString()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errorDisplayed, setErrorDisplayed] = React.useState<string | null>(null)

  if (error && (!errorDisplayed || errorDisplayed !== error)) {
    setErrorDisplayed(error)
    handleSignError(error)
  }

  const form = useForm<IForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: IForm) {
    setIsLoading(true)
    await handleSignIn(data, callbackUrl, router)
    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props} className={cn("grid gap-2", props.className)}>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <FormField
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            form={form}
            name="email"
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
        <Button type="submit" isLoading={isLoading}>
          Sign In
        </Button>
      </form>
    </Form>
  )
}
