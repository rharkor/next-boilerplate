"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import FormField from "@/components/ui/form-field"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { authRoutes } from "@/lib/auth/constants"
import { TDictionary } from "@/lib/langs"
import { resetPasswordSchema } from "@/lib/schemas/user"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"

const formSchema = resetPasswordSchema
type IForm = z.infer<ReturnType<typeof formSchema>>

export default function ResetPasswordForm({ dictionary, token }: { dictionary: TDictionary; token: string }) {
  const router = useRouter()

  const resetPasswordMutation = trpc.me.resetPassword.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
    onSuccess: () => {
      toast({
        title: dictionary.resetPasswordSuccessTitle,
        description: dictionary.resetPasswordSuccessDescription,
      })
      router.push(authRoutes.signIn[0])
    },
  })

  const form = useForm<IForm>({
    resolver: zodResolver(formSchema(dictionary)),
    defaultValues: {
      token,
      password: "",
      passwordConfirmation: "",
    },
  })

  async function onSubmit(data: IForm) {
    resetPasswordMutation.mutate(data)
  }

  const isLoading = resetPasswordMutation.isLoading

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={"!mt-5 grid w-[350px] space-y-2"}>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="password">
            {dictionary.password}
          </Label>
          <FormField
            name="password"
            type="password-eye-slash"
            placeholder={dictionary.password}
            autoComplete="new-password"
          />
        </div>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="passwordConfirmation">
            {dictionary.passwordConfirmation}
          </Label>
          <FormField
            name="passwordConfirmation"
            type="password"
            placeholder={dictionary.passwordConfirmation}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" isLoading={isLoading}>
          {dictionary.reset}
        </Button>
      </form>
    </Form>
  )
}
