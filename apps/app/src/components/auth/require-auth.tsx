import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authRoutes } from "@/constants/auth"
import { nextAuthOptions } from "@/lib/auth"
import { logger } from "@next-boilerplate/lib"

export default async function requireAuth(callbackUrl?: string) {
  const session = await getServerSession(nextAuthOptions)
  if (!session) {
    let searchParams = ""
    if (callbackUrl) {
      searchParams = "?" + new URLSearchParams({ callbackUrl }).toString()
    } else {
      const baseUrl = headers().get("x-url")
      if (!baseUrl) {
        logger.warn("No base url found in headers")
      } else {
        const url = new URL(baseUrl)
        searchParams = "?" + new URLSearchParams({ callbackUrl: url.pathname }).toString()
      }
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
