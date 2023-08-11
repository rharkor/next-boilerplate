import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import * as z from "zod"
import { hash } from "@/lib/bcrypt"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/utils"
import { signUpSchema } from "@/types/auth"

export async function POST(req: Request) {
  try {
    const reqData = (await req.json()) as z.infer<ReturnType<typeof signUpSchema>>
    const bodyParsedResult = signUpSchema().safeParse(reqData)
    if (!bodyParsedResult.success) return ApiError(bodyParsedResult.error.message, { status: 400 })
    const { email, password, username } = bodyParsedResult.data
    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      user: {
        username: user.username,
        email: user.email,
      },
    })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const meta = error.meta
        if (!meta) return ApiError("Account already exists", { status: 400 })
        if ((meta.target as Array<string>).includes("email")) {
          return ApiError("Email already exists", { status: 400 })
        } else if ((meta.target as Array<string>).includes("username")) {
          return ApiError("Username already exists", { status: 400 })
        }
      }
    }
    logger.error(error)
    if (error instanceof Error) {
      return ApiError(error.message, { status: 500 })
    } else {
      return ApiError("An unknown error occurred", { status: 500 })
    }
  }
}
