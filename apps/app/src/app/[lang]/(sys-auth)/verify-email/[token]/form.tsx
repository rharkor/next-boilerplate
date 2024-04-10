"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { authRoutes } from "@/constants/auth"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { Button } from "@nextui-org/react"

export default function VerifyEmailButton({
  token,
  dictionary,
}: {
  token: string
  dictionary: TDictionary<{
    verifyEmail: true
    verifyEmailSuccessDescription: true
  }>
}) {
  const router = useRouter()

  const verifyEmail = trpc.me.verifyEmail.useMutation({
    onSuccess: () => {
      toast.success(dictionary.verifyEmailSuccessDescription)
      router.push(authRoutes.redirectAfterSignIn)
    },
  })

  async function onSubmit() {
    verifyEmail.mutate({ token })
  }

  const isLoading = verifyEmail.isLoading

  return (
    <div className={"!mt-5 grid w-[350px] space-y-2"}>
      <Button onClick={onSubmit} isLoading={isLoading} color="primary">
        {dictionary.verifyEmail}
      </Button>
    </div>
  )
}
