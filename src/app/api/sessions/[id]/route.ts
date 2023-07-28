import { NextResponse } from "next/server"
import { requireAuthApi } from "@/components/auth/require-auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: Request, { params: { id } }: { params: { id: string } }) {
  const { session, error } = await requireAuthApi()
  if (error) return error

  if (!id) {
    return new Response("Missing id", { status: 400 })
  }

  const res = await prisma.session.delete({
    where: {
      id: id,
      userId: session.user.id,
    },
  })

  return NextResponse.json(res)
}
