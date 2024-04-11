"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"

import { resetPasswordSchema } from "@/api/me/schemas"
import FormField from "@/components/ui/form"
import { authRoutes } from "@/constants/auth"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"

import { ResetPasswordFormDr } from "./form.dr"

const formSchema = resetPasswordSchema
type IForm = z.infer<ReturnType<typeof formSchema>>

export default function ResetPasswordForm({
  token,
  dictionary,
}: {
  token: string
  dictionary: TDictionary<typeof ResetPasswordFormDr>
}) {
  const router = useRouter()

  const resetPasswordMutation = trpc.me.resetPassword.useMutation({
    onSuccess: () => {
      toast.success(dictionary.resetPasswordSuccessDescription)
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
    <form onSubmit={form.handleSubmit(onSubmit)} className={"!mt-5 grid w-[350px] space-y-2"}>
      <FormField
        form={form}
        name="password"
        type="password-eye-slash"
        aria-label={dictionary.password}
        placeholder={dictionary.password}
        autoComplete="new-password"
      />
      <FormField
        form={form}
        name="passwordConfirmation"
        type="password"
        aria-label={dictionary.passwordConfirmation}
        placeholder={dictionary.passwordConfirmation}
        autoComplete="new-password"
      />
      <Button type="submit" color="primary" isLoading={isLoading}>
        {dictionary.reset}
      </Button>
    </form>
  )
}
