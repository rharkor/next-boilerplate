"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Tooltip } from "@nextui-org/react"
import { Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"
import AutoRefresh from "@/components/auto-refresh"
import FormField from "@/components/ui/form"
import { TDictionary } from "@/lib/langs"
import { forgotPasswordSchema } from "@/lib/schemas/user"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"
import { resendResetPasswordExpiration } from "@/types/constants"

const formSchema = forgotPasswordSchema
type IForm = z.infer<ReturnType<typeof formSchema>>

export default function ForgotPasswordForm({ dictionary }: { dictionary: TDictionary }) {
  const router = useRouter()

  const [latestEmailSentAt, setLatestEmailSentAt] = useState<number | null>(null)

  const forgotPasswordMutation = trpc.me.forgotPassword.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
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

  const isLoading = forgotPasswordMutation.isLoading
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
        disabled={isDisabled}
      />
      <Button type="submit" isLoading={isLoading} disabled={isDisabled} color="primary">
        {dictionary.send}
      </Button>
      {latestEmailSentAt !== null && (
        <Tooltip content={dictionary.timeUntilYouCanRequestAnotherEmail}>
          <AutoRefresh
            callback={() => {
              const retryInValue = retryIn()
              const retryInFormatted =
                retryInValue && retryInValue.getTime() > 0
                  ? `${Math.floor(retryInValue.getTime() / 1000 / 60)}:${
                      Math.floor(retryInValue.getTime() / 1000) % 60
                    }`
                  : null
              return (
                <div className="ml-auto flex flex-row items-center text-sm text-gray-500">
                  <Clock className="mr-1 inline-block h-4 w-4" />
                  {retryInFormatted}
                </div>
              )
            }}
            interval={1000}
          />
        </Tooltip>
      )}
    </form>
  )
}
