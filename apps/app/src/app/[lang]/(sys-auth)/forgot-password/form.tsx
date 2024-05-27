"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"

import { forgotPasswordSchema } from "@/api/me/schemas"
import AutoRefresh from "@/components/auto-refresh"
import FormField from "@/components/ui/form"
import { resendResetPasswordExpiration } from "@/constants"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Tooltip } from "@nextui-org/react"

import { ForgotPasswordFormDr } from "./form.dr"

const formSchema = forgotPasswordSchema
type IForm = z.infer<ReturnType<typeof formSchema>>

export default function ForgotPasswordForm({ dictionary }: { dictionary: TDictionary<typeof ForgotPasswordFormDr> }) {
  const [latestEmailSentAt, setLatestEmailSentAt] = useState<number | null>(null)

  const forgotPasswordMutation = trpc.me.forgotPassword.useMutation({
    onSuccess: () => {
      setLatestEmailSentAt(Date.now())
      toast.success(dictionary.forgotPasswordSuccessDescription)
    },
  })

  const form = useForm<IForm>({
    resolver: zodResolver(formSchema(dictionary)),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: IForm) {
    forgotPasswordMutation.mutate(data)
  }

  const isLoading = forgotPasswordMutation.isPending
  const retryIn = () =>
    latestEmailSentAt ? new Date(resendResetPasswordExpiration - (Date.now() - latestEmailSentAt)) : null
  const retryInValue = retryIn()
  const isDisabled = isLoading || (latestEmailSentAt && retryInValue ? retryInValue.getTime() > 0 : false)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={"relative !mt-5 grid w-[350px] space-y-2"}>
      <FormField
        form={form}
        name="email"
        placeholder={dictionary.emailPlaceholder}
        aria-label={dictionary.email}
        type="email"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect="off"
        isDisabled={isDisabled}
      />
      <Button type="submit" isLoading={isLoading} isDisabled={isDisabled} color="primary">
        {dictionary.send}
      </Button>
      {latestEmailSentAt !== null && (
        <Tooltip content={dictionary.timeUntilYouCanRequestAnotherEmail}>
          <div className="ml-auto w-max">
            <AutoRefresh
              callback={() => {
                const retryInValue = retryIn()
                if (!retryInValue || !(retryInValue.getTime() > 0)) {
                  return null
                }
                const minutes = Math.floor(retryInValue.getTime() / 1000 / 60)
                const seconds = Math.floor(retryInValue.getTime() / 1000) % 60
                const retryInFormatted = `${minutes ? `${minutes.toString().padStart(2, "0")}:` : ""}${seconds
                  .toString()
                  .padStart(2, "0")}`
                return (
                  <div className="ml-auto flex flex-row items-center text-sm text-gray-500">
                    <Clock className="mr-1 inline-block size-4" />
                    {retryInFormatted}
                  </div>
                )
              }}
              interval={1000}
            />
          </div>
        </Tooltip>
      )}
    </form>
  )
}
