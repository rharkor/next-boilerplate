import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { nextAuthOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

export default async function requireAuth(callbackUrl?: string) {
  const session = await getServerSession(nextAuthOptions)
  if (!session?.user) {
    let searchParams = ""
    if (callbackUrl) {
      searchParams = "?" + new URLSearchParams({ callbackUrl }).toString()
    }
    logger.debug("requireAuth: redirecting to /sign-in" + searchParams)
    redirect("/sign-in" + searchParams)
  }
}
