import { ITrpcContext } from "@/types"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

export function createContext(opts?: FetchCreateContextFnOptions) {
  const response: ITrpcContext = {
    session: null,
    headers: opts && Object.fromEntries(opts.req.headers),
    req: opts && opts.req,
  }
  return response
}

export type Context = Awaited<ReturnType<typeof createContext>>
