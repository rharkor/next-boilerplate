import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { authRoutes } from "@/lib/auth/constants"

export default function Home() {
  return (
    <main className="container flex flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <nav className="flex flex-col items-center justify-center">
        <ul className="flex flex-row items-center justify-center gap-2">
          <li>
            <Link href={authRoutes.signIn[0]} className={buttonVariants({ variant: "ghost" })}>
              Sign In
            </Link>
          </li>
          <li>
            <Link href={authRoutes.signUp[0]} className={buttonVariants({ variant: "ghost" })}>
              Sign Up
            </Link>
          </li>
          <li>
            <Link href="/profile" className={buttonVariants({ variant: "ghost" })}>
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}
