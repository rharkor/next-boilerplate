import { getServerSession } from "next-auth"
import SignoutButton from "@/components/auth/sign-out-button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { nextAuthOptions } from "@/lib/auth"
import SeeDetailsToggle from "./see-details-toggle"

export default async function Profile() {
  const session = await getServerSession(nextAuthOptions)

  return (
    <main className="container flex flex-1 flex-col items-center justify-center p-6">
      <div>
        <Card className="relative z-10 m-auto max-w-full">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded bg-muted p-2">{JSON.stringify(session, null, 2)}</pre>
          </CardContent>
          <CardFooter>
            <div className="ml-auto">
              <SignoutButton />
            </div>
          </CardFooter>
        </Card>
        <SeeDetailsToggle />
      </div>
    </main>
  )
}
