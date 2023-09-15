import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { getProviders } from "next-auth/react"
import GithubSignIn from "@/components/auth/github-sign-in"
import { nextAuthOptions } from "@/lib/auth"
import { TDictionary } from "@/lib/langs"

export default async function Providers({
  dictionary,
  searchParams,
}: {
  dictionary: TDictionary
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const providers = await getProviders()
  const session = await getServerSession(nextAuthOptions)

  const callbackUrl = searchParams.callbackUrl ? searchParams.callbackUrl.toString() : undefined

  //? If session and callbackUrl, redirect to callbackUrl
  if (session && callbackUrl) {
    redirect(callbackUrl)
  }

  return <>{providers?.github && <GithubSignIn provider={providers.github} dictionary={dictionary} />}</>
}
