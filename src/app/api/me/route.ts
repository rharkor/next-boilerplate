import { NextResponse } from "next/server"
import { requireAuthApi } from "@/components/auth/require-auth"
import { prisma } from "@/lib/prisma"
import { apiRateLimiter, mergeRateLimitHeaders } from "@/lib/rate-limit"
import { ApiError } from "@/lib/utils"
import { UpdateUserSchema } from "@/types/api"

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

export async function PATCH(request: Request) {
  const { session, error: authError } = await requireAuthApi()
  if (authError) return authError

  //? Rate limit for updating user
  const {
    success,
    errorResponse: throttlerErrorResponse,
    headers,
  } = await apiRateLimiter(request, {
    limitPerInterval: 10,
    duration: 60,
    preprendIdentifier: `update_user:${session.user.id}`,
  })
  if (!success) return throttlerErrorResponse

  const body = await request.json()
  const bodyParsedResult = UpdateUserSchema().safeParse(body)
  if (!bodyParsedResult.success) return ApiError(bodyParsedResult.error.message, { status: 400 })
  const bodyParsed = bodyParsedResult.data

  //* Update the user
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      username: bodyParsed.username,
    },
  })

  return NextResponse.json(
    {
      success: true,
    },
    {
      headers: mergeRateLimitHeaders(request.headers, headers),
    }
  )
}
