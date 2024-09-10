import SuperJSON from "superjson"

import { AppRouter } from "@/api/_app"
import { createTRPCClient, httpBatchLink } from "@trpc/client"

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `/api/trpc`,
      transformer: SuperJSON,
    }),
  ],
})

const main = async () => {
  // const me = await client.me.getAccount.query()
  // logger.info(me)
}

main()
