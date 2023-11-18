"use client"

import { Button } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { authRoutes } from "@/lib/auth/constants"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"

export default function VerifyEmailButton({ dictionary, token }: { dictionary: TDictionary; token: string }) {
  const router = useRouter()

  const verifyEmail = trpc.me.verifyEmail.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
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
