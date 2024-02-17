"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { env } from "env.mjs"
import { ArrowBigDown, BadgeInfo } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useDictionary } from "@/contexts/dictionary/utils"
import { authRoutes } from "@/lib/auth/constants"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { signInSchema } from "@/lib/schemas/auth"
import { cn, ensureRelativeUrl } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Card, CardBody, Link } from "@nextui-org/react"

import TotpVerificationModal from "../profile/totp/totp-verification-modal"
import Copiable from "../ui/copiable"
import FormField from "../ui/form"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  searchParams: { [key: string]: string | string[] | undefined }
}

const formSchema = signInSchema

type IForm = z.infer<ReturnType<typeof formSchema>>

export function LoginUserAuthForm({ searchParams, ...props }: UserAuthFormProps) {
  const dictionary = useDictionary()
  const router = useRouter()

  const callbackUrl = ensureRelativeUrl(searchParams.callbackUrl?.toString()) || authRoutes.redirectAfterSignIn
  const error = searchParams.error?.toString()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errorDisplayed, setErrorDisplayed] = React.useState<string | null>(null)

  if (error && !error.startsWith("_") && (!errorDisplayed || errorDisplayed !== error)) {
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

  const [isDesactivate2FAModalOpen, setDesactivate2FAModalOpen] = React.useState(false)
  const [otpPromiseResolve, setOtpPromiseResolve] = React.useState<(otp: string | null) => void>()

  const getOtpCode = () => {
    return new Promise<string>((resolve) => {
      setOtpPromiseResolve(() => resolve)
      setDesactivate2FAModalOpen(true)
    })
  }

  async function onSubmit(data: IForm) {
    setIsLoading(true)
    try {
      const isPushingRoute = await handleSignIn({ data, callbackUrl, router, dictionary, getOtpCode })
      //? If isPushingRoute is true, it means that the user is being redirected to the callbackUrl
      if (!isPushingRoute) setIsLoading(false)
    } catch (e) {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props} className={cn("grid space-y-2", props.className)}>
        {env.NEXT_PUBLIC_IS_DEMO && (
          <Card className="relative">
            <CardBody>
              <h3 className="flex flex-row items-center gap-1">
                <BadgeInfo className="size-4" />
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
                  <ArrowBigDown className="size-5" />
                </div>
              </div>
            </CardBody>
          </Card>
        )}
        <FormField
          form={form}
          name="email"
          label={dictionary.email}
          type="email"
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect="off"
          isDisabled={isLoading}
        />
        <FormField
          form={form}
          name={"password"}
          label={dictionary.password}
          type="password-eye-slash"
          autoComplete="current-password"
          autoCorrect="off"
          isDisabled={isLoading}
        />
        <Link className="text-muted-foreground hover:text-primary ml-auto text-sm" href={"/forgot-password"}>
          {dictionary.forgotPassword}
        </Link>
        <Button type="submit" isLoading={isLoading} color="primary">
          {dictionary.signIn}
        </Button>
      </form>
      <TotpVerificationModal
        dictionary={dictionary}
        isOpen={isDesactivate2FAModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen && otpPromiseResolve) {
            otpPromiseResolve(null)
          }
          setDesactivate2FAModalOpen(isOpen)
        }}
        onConfirm={(otp) => {
          if (otpPromiseResolve) {
            otpPromiseResolve(otp)
            setDesactivate2FAModalOpen(false)
          }
        }}
        title={dictionary.totp.enterCode}
        submitText={dictionary.confirm}
        closeText={dictionary.cancel}
        onlyPrompt
        curEmail={form.watch("email")}
      />
    </>
  )
}
