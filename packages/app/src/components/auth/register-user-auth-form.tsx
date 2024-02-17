"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useDictionary } from "@/contexts/dictionary/utils"
import { authRoutes } from "@/lib/auth/constants"
import { handleSignError, handleSignIn } from "@/lib/auth/handle-sign"
import { TDictionary } from "@/lib/langs"
import { signUpSchema } from "@/lib/schemas/auth"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { handleMutationError } from "@/lib/utils/client-utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { logger } from "@lib/logger"
import { Button } from "@nextui-org/react"

import TotpVerificationModal from "../profile/totp/totp-verification-modal"
import FormField from "../ui/form"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  isMinimized?: boolean
  searchParams?: { [key: string]: string | string[] | undefined }
  locale: string
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

export function RegisterUserAuthForm({ isMinimized, searchParams, locale, ...props }: UserAuthFormProps) {
  const dictionary = useDictionary()
  const router = useRouter()

  const [isDesactivate2FAModalOpen, setDesactivate2FAModalOpen] = React.useState(false)
  const [otpPromiseResolve, setOtpPromiseResolve] = React.useState<(otp: string | null) => void>()

  const getOtpCode = () => {
    return new Promise<string>((resolve) => {
      setOtpPromiseResolve(() => resolve)
      setDesactivate2FAModalOpen(true)
    })
  }

  const registerMutation = trpc.auth.register.useMutation({
    onError: (error) => {
      setIsLoading(false)
      const translatedError = handleMutationError(error, dictionary, router, { showNotification: false })
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
    },
    meta: {
      noDefaultErrorHandling: true,
    },
    onSuccess: (_, vars) => {
      logger.debug("Sign up successful")
      handleSignIn({
        data: { email: vars.email, password: vars.password },
        callbackUrl: authRoutes.redirectAfterSignIn,
        router,
        dictionary,
        getOtpCode,
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
      locale,
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
    <>
      <form
        onSubmit={form.handleSubmit(isMinimized ? onSubmitMinimized : onSubmit)}
        {...props}
        className={cn("grid gap-2", props.className)}
      >
        <div className="relative">
          <FormField
            form={form}
            name="email"
            label={dictionary.email}
            type="email"
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            isDisabled={isLoading || !isMinimized}
          />
          {!isMinimized && (
            <Button
              as={Link}
              href={`${authRoutes.signUp[0]}?email=${form.getValues("email")}`}
              className="absolute right-2 top-2 z-10"
            >
              {dictionary.edit}
            </Button>
          )}
        </div>

        {!isMinimized && (
          <>
            <FormField
              form={form}
              name="username"
              label={dictionary.username}
              type="text"
              autoCapitalize="none"
              autoComplete="none"
              autoCorrect="off"
              isDisabled={isLoading}
            />
            <FormField
              form={form}
              name="password"
              label={dictionary.password}
              type="password-eye-slash"
              autoComplete="new-password"
              autoCorrect="off"
              isDisabled={isLoading}
              passwordStrength
            />
            <FormField
              form={form}
              name="confirmPassword"
              label={dictionary.confirmPassword}
              type="password"
              autoComplete="new-password"
              autoCorrect="off"
              isDisabled={isLoading}
            />
          </>
        )}
        <Button type="submit" isLoading={isLoading} color="primary">
          {dictionary.signUp} {isMinimized && dictionary.withEmail}
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
        title={dictionary.totp.desactivateTitle}
        submitText={dictionary.totp.desactivate}
        closeText={dictionary.cancel}
        onlyPrompt
      />
    </>
  )
}
