import { redirect } from "next/navigation"
import { authRoutes } from "@/lib/auth/constants"

export default function SignInRedirect() {
  redirect(authRoutes.signIn[0])
}
