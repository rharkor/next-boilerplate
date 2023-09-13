import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { getAuthApi } from "@/components/auth/require-auth"
import { ITrpcContext } from "@/types"

export async function createContext(opts?: FetchCreateContextFnOptions) {
  const { session } = await getAuthApi()

  const response: ITrpcContext = {
    session,
    headers: opts && Object.fromEntries(opts.req.headers),
    req: opts && opts.req,
  }
  return response
}

export type Context = Awaited<ReturnType<typeof createContext>>
