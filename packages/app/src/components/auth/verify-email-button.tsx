"use client"

import { Session } from "next-auth"
import { BadgeCheck } from "lucide-react"
import { toast } from "react-toastify"

import { useAccount } from "@/contexts/account"
import { useDictionary } from "@/contexts/dictionary/utils"
import { trpc } from "@/lib/trpc/client"
import { logger } from "@lib/logger"
import { Button } from "@nextui-org/react"

export default function VerifyEmailButton({ session }: { session: Session }) {
  const dictionary = useDictionary()
  const account = useAccount(dictionary)
  const hasVerifiedEmail = session.user.emailVerified || !!account.data?.user.emailVerified

  const resendVerificationEmailMutation = trpc.me.sendVerificationEmail.useMutation({
    onSuccess: () => {
      toast(dictionary.emailVerificationSentDescription)
    },
  })

  const handleResendVerificationEmail = () => {
    if (!session.user.email) {
      logger.error("No email found in session")
      return
    }
    resendVerificationEmailMutation.mutate({
      email: session.user.email,
    })
  }

  if (hasVerifiedEmail) {
    return (
      <p className="text-primary flex w-max flex-1 items-center space-x-2 font-medium">
        <BadgeCheck className="inline-block size-5" />
        <span>{dictionary.emailAlreadyVerified}</span>
      </p>
    )
  }

  return (
    <Button
      onClick={handleResendVerificationEmail}
      isLoading={resendVerificationEmailMutation.isLoading}
      className="flex-1 md:w-max"
      variant="flat"
      color="primary"
    >
      {dictionary.resendVerificationEmail}
    </Button>
  )
}
