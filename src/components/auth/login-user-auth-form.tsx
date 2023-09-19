"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeInfo } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as z from "zod"
import { authRoutes } from "@/lib/auth/constants"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { TDictionary } from "@/lib/langs"
import { signInSchema } from "@/lib/schemas/auth"
import { cn, ensureRelativeUrl } from "@/lib/utils"
import { env } from "env.mjs"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Button } from "../ui/button"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"
import { Label } from "../ui/label"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  dictionary: TDictionary
  searchParams: { [key: string]: string | string[] | undefined }
}

const formSchema = signInSchema

type IForm = z.infer<ReturnType<typeof formSchema>>

export function LoginUserAuthForm({ dictionary, searchParams, ...props }: UserAuthFormProps) {
  const router = useRouter()

  const callbackUrl = ensureRelativeUrl(searchParams.callbackUrl?.toString()) || authRoutes.redirectAfterSignIn
  const error = searchParams.error?.toString()

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
    try {
      const isPushingRoute = await handleSignIn({ data, callbackUrl, router, dictionary })
      //? If isPushingRoute is true, it means that the user is being redirected to the callbackUrl
      if (!isPushingRoute) setIsLoading(false)
    } catch (e) {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (value?: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    toast(dictionary.copiedToClipboard)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props} className={cn("grid space-y-2", props.className)}>
        {env.NEXT_PUBLIC_IS_DEMO && (
          <div>
            <Alert>
              <BadgeInfo className="h-4 w-4" />
              <AlertTitle>{dictionary.auth.demoMode}</AlertTitle>
              <AlertDescription className="flex flex-col">
                <p className="m-1">
                  {dictionary.email}:{" "}
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
                  {dictionary.password}:{" "}
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
            {dictionary.email}
          </Label>
          <FormField
            placeholder={dictionary.emailPlaceholder}
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            name="email"
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
            name="password"
          />
        </div>
        <Link className="ml-auto text-sm text-muted-foreground hover:text-primary" href={"/forgot-password"}>
          {dictionary.forgotPassword}
        </Link>
        <Button type="submit" isLoading={isLoading}>
          {dictionary.signIn}
        </Button>
      </form>
    </Form>
  )
}
