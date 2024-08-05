import { Metadata } from "next"
import { redirect } from "next/navigation"

import { authRoutes } from "@/constants/auth"
import { env } from "@/lib/env"

export const metadata: Metadata = {
  title: "Sign-up",
  description: "Create an account",
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  if (env.DISABLE_REGISTRATION === true) {
    redirect(authRoutes.signIn[0])
  }
  return <>{children}</>
}
