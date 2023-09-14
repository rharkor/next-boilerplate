import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { nextAuthOptions } from "@/lib/auth"
import { authRoutes } from "@/lib/auth/constants"
import { logger } from "@/lib/logger"
import { validateSession } from "@/lib/utils/server-utils"

export default async function requireAuth(callbackUrl?: string) {
  const session = await getServerSession(nextAuthOptions)
  if (!session || !session.user.id) {
    let searchParams = ""
    if (callbackUrl) {
      searchParams = "?" + new URLSearchParams({ callbackUrl }).toString()
    }
    logger.debug("requireAuth: redirecting to /sign-in" + searchParams)
    redirect(authRoutes.signIn[0] + searchParams)
  }

  return session
}

export async function getAuthApi() {
  const session = await getServerSession(nextAuthOptions)
  if (!session || !session.user.id) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const sessionValidationError = await validateSession(session)
  if (sessionValidationError) {
    return { session: null, error: NextResponse.json({ error: sessionValidationError }, { status: 403 }) }
  }

  return { session, error: null }
}
