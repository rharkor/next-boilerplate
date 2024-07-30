import SuperJSON from "superjson"

import { AppRouter } from "@/api/_app"
import { env } from "@/lib/env"
import { getBaseUrl } from "@/lib/trpc/utils"
import { logger } from "@next-boilerplate/lib"
import { createTRPCClient, httpBatchLink } from "@trpc/client"

// Insert your token here (for authenticated requests)
let token: string | undefined = undefined
const getAuthCookie = () => {
  return token
}

const signIn = async () => {
  const csrfResponse = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/auth/csrf`)
  // Get csrf token from cookies
  const csrfSetCookies = (csrfResponse.headers.get("set-cookie") ?? "")
    .replace(/Path=\/; HttpOnly; SameSite=Lax,?\s?/g, "")
    .replace(/;\s?$/g, "")
  // Extract authjs.csrf-token=
  const csrfToken = csrfSetCookies.split("authjs.csrf-token=")[1].split(";")[0]

  const formData = new URLSearchParams()
  if (!env.NEXT_PUBLIC_DEMO_EMAIL || !env.NEXT_PUBLIC_DEMO_PASSWORD) {
    logger.error("Please provide a demo email and password in your .env file")
    return
  }
  formData.append("email", env.NEXT_PUBLIC_DEMO_EMAIL)
  formData.append("password", env.NEXT_PUBLIC_DEMO_PASSWORD)
  const credentialsResponse = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/credentials?`, {
    headers: {
      cookie: csrfSetCookies,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `redirect=false&callbackUrl=%2Fexamples%2Fprofile&otp=undefined&csrfToken=${
      csrfToken.split("%")[0]
    }&${formData.toString()}`,
    method: "POST",
    redirect: "manual",
  })
  // Get auth token from cookies
  const authSetCookies = credentialsResponse.headers.get("set-cookie") ?? ""
  // Extract the token authjs.session-token=
  const authCookie = authSetCookies.split("authjs.session-token=")[1].split(";")[0]
  // Save the token
  logger.success("Signed in")
  token = authCookie
}

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: SuperJSON,
      async headers() {
        const token = getAuthCookie()
        return {
          cookie: token ? `authjs.session-token=${token}` : "",
        }
      },
    }),
  ],
})

const main = async () => {
  await signIn()

  const me = await client.me.getAccount.query()
  logger.info(me)
}

main()
