import { NextResponse } from "next/server"
import { requireAuthApi } from "@/components/auth/require-auth"

export async function GET() {
  const { session, error } = await requireAuthApi()
  if (error) return error

  return NextResponse.json({
    session,
  })
}
