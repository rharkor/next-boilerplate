"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Card, CardBody, Link } from "@nextui-org/react"
import { ArrowBigDown, BadgeInfo } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { authRoutes } from "@/lib/auth/constants"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { TDictionary } from "@/lib/langs"
import { signInSchema } from "@/lib/schemas/auth"
import { cn, ensureRelativeUrl } from "@/lib/utils"
import { env } from "env.mjs"
import Copiable from "../ui/copiable"
import FormField from "../ui/form"

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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} {...props} className={cn("grid space-y-2", props.className)}>
      {env.NEXT_PUBLIC_IS_DEMO && (
        <Card className="relative">
          <CardBody>
            <h3 className="flex flex-row items-center gap-1">
              <BadgeInfo className="h-4 w-4" />
              {dictionary.auth.demoMode}
            </h3>
            <div className="flex flex-col">
              <p className="m-1">
                {dictionary.email}: <Copiable text={env.NEXT_PUBLIC_DEMO_EMAIL} dictionary={dictionary} />
              </p>
              <p className="m-1">
                {dictionary.password}: <Copiable text={env.NEXT_PUBLIC_DEMO_PASSWORD} dictionary={dictionary} />
              </p>
              <div
                className="absolute bottom-2 right-2 cursor-pointer"
                onClick={() => {
                  form.setValue("email", env.NEXT_PUBLIC_DEMO_EMAIL ?? "")
                  form.setValue("password", env.NEXT_PUBLIC_DEMO_PASSWORD ?? "")
                }}
              >
                <ArrowBigDown className="h-5 w-5" />
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      <FormField
        form={form}
        name="email"
        aria-label={dictionary.email}
        placeholder={dictionary.emailPlaceholder}
        type="email"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect="off"
        disabled={isLoading}
      />
      <FormField
        form={form}
        name={"password"}
        aria-label={dictionary.password}
        placeholder={dictionary.passwordPlaceholder}
        type="password-eye-slash"
        autoComplete="new-password"
        autoCorrect="off"
        disabled={isLoading}
      />
      <Link className="ml-auto text-sm text-muted-foreground hover:text-primary" href={"/forgot-password"}>
        {dictionary.forgotPassword}
      </Link>
      <Button type="submit" isLoading={isLoading} color="primary">
        {dictionary.signIn}
      </Button>
    </form>
  )
}
