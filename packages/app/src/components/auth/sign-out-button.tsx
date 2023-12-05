"use client"

import { Button } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"

export default function SignoutButton({
  children,
  dictionary,
}: {
  children: React.ReactNode
  dictionary: TDictionary
}) {
  const router = useRouter()
  const session = useSession()
  const utils = trpc.useUtils()

  const currentSession = session.data?.user.uuid

  const deleteSessionMutation = trpc.me.deleteSession.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
    onSettled: () => {
      utils.me.getActiveSessions.invalidate()
    },
  })

  const [signOutLoading, setSignOutLoading] = useState(false)
  const handleSignOut = async () => {
    setSignOutLoading(true)
    try {
      //? Before signing out, we want to delete the session from the server
      if (currentSession)
        await deleteSessionMutation.mutateAsync({
          id: currentSession,
        })
    } catch (e) {
      logger.error(e)
    }
    await signOut()
    setSignOutLoading(false)
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} isLoading={signOutLoading}>
      {children}
    </Button>
  )
}
