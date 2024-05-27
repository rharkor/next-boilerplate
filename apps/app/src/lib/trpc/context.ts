import { ITrpcContext } from "@/types"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

export function createContext(opts?: FetchCreateContextFnOptions, fromServer?: boolean) {
  const response: ITrpcContext = {
    session: null,
    headers: opts && Object.fromEntries(opts.req.headers),
    req: opts && opts.req,
    fromServer,
  }
  return response
}

export type Context = Awaited<ReturnType<typeof createContext>>
