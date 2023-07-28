import { NextResponse } from "next/server"
import { requireAuthApi } from "@/components/auth/require-auth"
import { getJsonApiSkip, getJsonApiSort, getJsonApiTake, IJsonApiResponse, parseJsonApiQuery } from "@/lib/json-api"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { session, error } = await requireAuthApi()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const query = parseJsonApiQuery(searchParams)

  const activeSessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
    },
    skip: getJsonApiSkip(query),
    take: getJsonApiTake(query),
    orderBy: getJsonApiSort(query),
  })

  const total = await prisma.session.count({
    where: {
      userId: session.user.id,
    },
  })

  const response: IJsonApiResponse<(typeof activeSessions)[number]> = {
    data: activeSessions,
    meta: {
      total: activeSessions.length,
      page: query.page,
      perPage: query.perPage,
      totalPages: Math.ceil(total / query.perPage),
    },
  }

  return NextResponse.json(response)
}
