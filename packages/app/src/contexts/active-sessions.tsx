import { z } from "zod"

import { getActiveSessionsResponseSchema } from "@/lib/schemas/user"
import { trpc } from "@/lib/trpc/client"

export function useActiveSessions(
  params: Parameters<typeof trpc.me.getActiveSessions.useQuery>["0"] = {},
  extendedOptions?: {
    initialData?: z.infer<ReturnType<typeof getActiveSessionsResponseSchema>>
    disabled?: boolean
  }
) {
  const activeSessionsQuery = trpc.me.getActiveSessions.useQuery(params, {
    initialData: extendedOptions?.initialData,
    enabled: !(extendedOptions?.disabled ?? false),
  })
  return activeSessionsQuery
}
