import { redirect } from "next/navigation"
import { authRoutes } from "@/lib/auth/constants"

export default function LoginRedirect() {
  redirect(authRoutes.signIn[0])
}
