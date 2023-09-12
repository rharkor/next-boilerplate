import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { getAuthApi } from "@/components/auth/require-auth"

export async function createContext(opts?: FetchCreateContextFnOptions) {
  const { session } = await getAuthApi()

  return {
    session,
    headers: opts && Object.fromEntries(opts.req.headers),
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
