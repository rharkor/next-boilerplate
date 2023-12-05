"use client"

import { Button } from "@nextui-org/react"
import { BadgeCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"
import { toast } from "react-toastify"
import { useAccount } from "@/contexts/account"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"

export default function VerifyEmailButton({ session, dictionary }: { session: Session; dictionary: TDictionary }) {
  const router = useRouter()
  const account = useAccount(dictionary)
  const hasVerifiedEmail = session.user.emailVerified || !!account.data?.user.emailVerified

  const resendVerificationEmailMutation = trpc.me.sendVerificationEmail.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
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
      <p className="flex w-max flex-1 items-center space-x-2 font-medium text-primary">
        <BadgeCheck className="inline-block h-5 w-5" />
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
