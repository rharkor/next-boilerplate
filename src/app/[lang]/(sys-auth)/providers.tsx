import { getProviders } from "next-auth/react"
import GithubSignIn from "@/components/auth/github-sign-in"
import { TDictionary } from "@/lib/langs"

export default async function Providers({ dictionary }: { dictionary: TDictionary }) {
  const providers = await getProviders()

  return <>{providers?.github && <GithubSignIn provider={providers.github} dictionary={dictionary} />}</>
}
