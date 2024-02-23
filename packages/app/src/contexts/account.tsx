import { z } from "zod"

import { getAccountResponseSchema } from "@/api/me/schemas"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"

export function useAccount(
  dictionary: TDictionary,
  extendedOptions?: {
    initialData?: z.infer<ReturnType<typeof getAccountResponseSchema>>
  }
) {
  const account = trpc.me.getAccount.useQuery(undefined, {
    initialData: extendedOptions?.initialData,
  })
  return account
}
