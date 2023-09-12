"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeInfo } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { TDictionary } from "@/lib/langs"
import { cn, ensureRelativeUrl } from "@/lib/utils"
import { signInSchema } from "@/types/auth"
import { env } from "env.mjs"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Button } from "../ui/button"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"
import { Label } from "../ui/label"
import { toast } from "../ui/use-toast"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  dictionary: TDictionary
  searchParams: { [key: string]: string | string[] | undefined }
}

export const formSchema = signInSchema

export type IForm = z.infer<ReturnType<typeof formSchema>>

export function LoginUserAuthForm({ dictionary, searchParams, ...props }: UserAuthFormProps) {
  const router = useRouter()

  const callbackUrl = ensureRelativeUrl(searchParams?.callbackUrl?.toString()) || "/profile"
  const error = searchParams?.error?.toString()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errorDisplayed, setErrorDisplayed] = React.useState<string | null>(null)

  if (error && (!errorDisplayed || errorDisplayed !== error)) {
    setErrorDisplayed(error)
    handleSignError(error, dictionary)
  }

  const form = useForm<IForm>({
    resolver: zodResolver(formSchema(dictionary)),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: IForm) {
    setIsLoading(true)
    const isPushingRoute = await handleSignIn({ data, callbackUrl, router, dictionary })
    //? If isPushingRoute is true, it means that the user is being redirected to the callbackUrl
    if (!isPushingRoute) setIsLoading(false)
  }

  const copyToClipboard = (value?: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    toast({
      description: "Copied to clipboard",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props} className={cn("grid gap-2", props.className)}>
        {env.NEXT_PUBLIC_IS_DEMO && (
          <div>
            <Alert>
              <BadgeInfo className="h-4 w-4" />
              <AlertTitle>Demo environment</AlertTitle>
              <AlertDescription className="flex flex-col">
                <p className="m-1">
                  email:{" "}
                  <code
                    className="cursor-pointer rounded p-1 transition-all hover:bg-primary/20"
                    onClick={() => {
                      copyToClipboard(env.NEXT_PUBLIC_DEMO_EMAIL)
                    }}
                  >
                    {env.NEXT_PUBLIC_DEMO_EMAIL}
                  </code>
                </p>
                <p className="m-1">
                  password:{" "}
                  <code
                    className="cursor-pointer rounded p-1 transition-all hover:bg-primary/20"
                    onClick={() => {
                      copyToClipboard(env.NEXT_PUBLIC_DEMO_PASSWORD)
                    }}
                  >
                    {env.NEXT_PUBLIC_DEMO_PASSWORD}
                  </code>
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}
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
