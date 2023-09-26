import { redirect } from "next/navigation"
import { authRoutes } from "@/lib/auth/constants"

export default function SignUpRedirect() {
  redirect(authRoutes.signUp[0])
}
