import { Metadata } from "next"
import { redirect } from "next/navigation"
import { authRoutes } from "@/lib/auth/constants"
import { env } from "env.mjs"

export const metadata: Metadata = {
  title: "Sign-up",
  description: "Create an account",
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  if (!env.ENABLE_REGISTRATION) {
    redirect(authRoutes.signIn[0])
  }
  return <>{children}</>
}
