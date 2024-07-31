import { NextResponse } from "next/server"
import { z } from "zod"

import { getAccount } from "@/api/me/queries"
import { getAccountResponseSchema } from "@/api/me/schemas"
import { auth } from "@/lib/auth"
import { apiMiddleware, handleNextApiError } from "@/lib/utils/server-utils"

//* Example of a route definition outside the router
// Can be usefull for external services
export const GET = auth(async (req) => {
  try {
    // const parsed = getTransactionSchema().safeParse({
    //   ...yourParams
    // })
    // if (!parsed.success) {
    //   return NextResponse.json(parsed.error, { status: 400 })
    // }

    //* Authenticated route
    const session = await apiMiddleware(req.auth, {
      authenticated: true,
    })

    const user = await getAccount({
      ctx: {
        session,
      },
      input: {},
    })
    const res: z.infer<ReturnType<typeof getAccountResponseSchema>> = user
    const resParsed = getAccountResponseSchema().safeParse(res)
    if (!resParsed.success) {
      return NextResponse.json(
        {
          message: "Output schema validation failed",
          error: resParsed.error,
        },
        { status: 500 }
      )
    }
    return NextResponse.json(resParsed.data)
  } catch (error: unknown) {
    return handleNextApiError(error)
  }
})
