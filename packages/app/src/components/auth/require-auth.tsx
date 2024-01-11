import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { nextAuthOptions } from "@/lib/auth"
import { authRoutes } from "@/lib/auth/constants"

export default async function requireAuth(callbackUrl?: string) {
  const session = await getServerSession(nextAuthOptions)
  if (!session) {
    let searchParams = ""
    if (callbackUrl) {
      searchParams = "?" + new URLSearchParams({ callbackUrl }).toString()
    }
    redirect(authRoutes.signIn[0] + searchParams)
  }

  return session
}

export async function getAuthApi() {
  const session = await getServerSession(nextAuthOptions)
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  return { session, error: null }
}
