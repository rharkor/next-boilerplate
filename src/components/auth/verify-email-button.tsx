"use client"

import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"
import { Button } from "../ui/button"
import { toast } from "../ui/use-toast"

export default function VerifyEmailButton({ session, dictionary }: { session: Session; dictionary: TDictionary }) {
  const router = useRouter()

  const resendVerificationEmailMutation = trpc.me.sendVerificationEmail.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
    onSuccess: () => {
      toast({
        title: dictionary.emailVerificationSentTitle,
        description: dictionary.emailVerificationSentDescription,
      })
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

  if (session.user.emailVerified) {
    return (
      <p className="w-max flex-1 text-primary">
        <Check className="mr-1 inline-block h-4 w-4" />
        {dictionary.emailAlreadyVerified}
      </p>
    )
  }

  return (
    <Button
      onClick={handleResendVerificationEmail}
      isLoading={resendVerificationEmailMutation.isLoading}
      className="flex-1 md:w-max"
    >
      {dictionary.resendVerificationEmail}
    </Button>
  )
}
