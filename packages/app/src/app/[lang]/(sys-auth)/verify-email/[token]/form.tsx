"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { useDictionary } from "@/contexts/dictionary/utils"
import { authRoutes } from "@/lib/auth/constants"
import { trpc } from "@/lib/trpc/client"
import { Button } from "@nextui-org/react"

export default function VerifyEmailButton({ token }: { token: string }) {
  const dictionary = useDictionary()
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
