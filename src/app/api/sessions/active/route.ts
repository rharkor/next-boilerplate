import { NextResponse } from "next/server"
import { requireAuthApi } from "@/components/auth/require-auth"
import { IJsonApiResponse, parseJsonApiQuery } from "@/lib/json-api"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { session, error } = await requireAuthApi()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const query = parseJsonApiQuery(searchParams)
  console.log(query)

  const activeSessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
    },
  })

  const response: IJsonApiResponse<(typeof activeSessions)[number]> = {
    data: activeSessions,
    meta: {
      total: activeSessions.length,
      page: 1,
      perPage: 10,
      totalPages: 1,
    },
  }

  NextResponse.next

  return NextResponse.json(response)
}
