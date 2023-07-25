import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { nextAuthOptions } from "@/lib/auth"
import { authRoutes } from "@/lib/auth/constants"
import { logger } from "@/lib/logger"

export default async function requireAuth(callbackUrl?: string) {
  const session = await getServerSession(nextAuthOptions)
  if (!session || !session.user || !session.user.id) {
    let searchParams = ""
    if (callbackUrl) {
      searchParams = "?" + new URLSearchParams({ callbackUrl }).toString()
    }
    logger.debug("requireAuth: redirecting to /sign-in" + searchParams)
    redirect(authRoutes.signIn[0] + searchParams)
  }

  return session
}

export async function requireAuthApi() {
  const session = await getServerSession(nextAuthOptions)
  if (!session || !session.user || !session.user.id) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  return { session, error: null }
}
