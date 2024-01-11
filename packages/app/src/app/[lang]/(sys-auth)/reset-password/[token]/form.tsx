"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"

import FormField from "@/components/ui/form"
import { useDictionary } from "@/contexts/dictionary/utils"
import { authRoutes } from "@/lib/auth/constants"
import { resetPasswordSchema } from "@/lib/schemas/user"
import { trpc } from "@/lib/trpc/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"

const formSchema = resetPasswordSchema
type IForm = z.infer<ReturnType<typeof formSchema>>

export default function ResetPasswordForm({ token }: { token: string }) {
  const dictionary = useDictionary()
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
