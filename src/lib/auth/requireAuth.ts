import type { GetServerSideProps, GetServerSidePropsContext } from "next"
import { getServerSession } from "next-auth"

import { nextAuthOptions } from "../auth"

export const requireAuth = (func: GetServerSideProps) => async (ctx: GetServerSidePropsContext) => {
  const session = await getServerSession(ctx.req, ctx.res, nextAuthOptions)

  if (!session) {
    return {
      redirect: {
        destination: "/sign-in", // login path
        permanent: false,
      },
    }
  }

  return await func(ctx)
}
