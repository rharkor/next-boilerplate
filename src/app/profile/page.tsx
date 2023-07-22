import { getServerSession } from "next-auth"
import requireAuth from "@/components/auth/require-auth"
import SignoutButton from "@/components/auth/sign-out-button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { nextAuthOptions } from "@/lib/auth"

export default async function Profile() {
  await requireAuth("/profile")
  const session = await getServerSession(nextAuthOptions)
  const user = session?.user

  return (
    <main className="container flex flex-1 items-center justify-center">
      <Card className="mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? <p>Loading...</p> : <pre className="rounded bg-muted p-2">{JSON.stringify(session, null, 2)}</pre>}
        </CardContent>
        <CardFooter>
          <div className="ml-auto">
            <SignoutButton />
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}
