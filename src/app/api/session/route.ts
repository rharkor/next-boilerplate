import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { nextAuthOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(nextAuthOptions)

  if (!session) {
    return new NextResponse(JSON.stringify({ status: "fail", message: "You are not logged in" }), { status: 401 })
  }

  return NextResponse.json({
    authenticated: !!session,
    session,
  })
}
