import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import GithubSignIn from "@/components/auth/github-sign-in"
import { nextAuthOptions, providersByName } from "@/lib/auth"
import { TDictionary } from "@/lib/langs"

export default async function Providers({
  dictionary,
  searchParams,
}: {
  dictionary: TDictionary
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(nextAuthOptions)

  const callbackUrl = searchParams.callbackUrl ? searchParams.callbackUrl.toString() : undefined

  //? If session and callbackUrl, redirect to callbackUrl
  if (session && callbackUrl) {
    console.log("redirect", session, callbackUrl)
    redirect(callbackUrl)
  }

  return (
    <>
      {providersByName.GitHub !== undefined && (
        <GithubSignIn providerId={providersByName.GitHub.id} dictionary={dictionary} />
      )}
    </>
  )
}
