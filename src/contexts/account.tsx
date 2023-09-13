import { useRouter } from "next/navigation"
import { z } from "zod"
import { handleQueryError } from "@/lib/client-utils"
import { TDictionary } from "@/lib/langs"
import { getAccountResponseSchema } from "@/lib/schemas/user"
import { trpc } from "@/lib/trpc/client"

export function useAccount(
  dictionary: TDictionary,
  extendedOptions?: {
    initialData?: z.infer<ReturnType<typeof getAccountResponseSchema>>
  }
) {
  const router = useRouter()
  const account = trpc.me.getAccount.useQuery(undefined, {
    initialData: extendedOptions?.initialData,
    onError(error) {
      handleQueryError(error, dictionary, router)
    },
  })
  return account
}
