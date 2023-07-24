import { NextResponse } from "next/server"
import requireAuth from "@/components/auth/require-auth"

export async function GET() {
  const session = await requireAuth()

  return NextResponse.json({
    session,
  })
}
