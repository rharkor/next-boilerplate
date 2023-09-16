"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import AutoRefresh from "@/components/auto-refresh"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import FormField from "@/components/ui/form-field"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
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
      toast({
        title: dictionary.forgotPasswordSuccessTitle,
        description: dictionary.forgotPasswordSuccessDescription,
      })
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={"relative !mt-5 grid w-[350px] space-y-2"}>
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
            disabled={isDisabled}
            name="email"
          />
        </div>
        <Button type="submit" isLoading={isLoading} disabled={isDisabled}>
          {dictionary.send}
        </Button>
        {latestEmailSentAt !== null && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="absolute -bottom-1 right-0 ml-auto flex w-max translate-y-full" type="button">
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
              </TooltipTrigger>
              <TooltipContent>
                <p>{dictionary.timeUntilYouCanRequestAnotherEmail}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </form>
    </Form>
  )
}
