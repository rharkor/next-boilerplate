"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"

import { trpc } from "@/lib/trpc/client"
import { logger } from "@lib/logger"
import { Button } from "@nextui-org/react"

export default function SignoutButton({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const utils = trpc.useUtils()

  const currentSession = session.data?.user.uuid

  const deleteSessionMutation = trpc.me.deleteSession.useMutation({
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
