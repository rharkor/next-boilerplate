import { NextResponse } from "next/server"
import { requireAuthApi } from "@/components/auth/require-auth"
import { apiRateLimiter } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const { session, error } = await requireAuthApi()
  if (error) return error

  const { success, errorResponse: throttlerErrorResponse, headers } = await apiRateLimiter(request)
  if (!success) return throttlerErrorResponse

  return NextResponse.json(
    {
      session,
    },
    {
      headers,
    }
  )
}
