import { redirect } from "next/navigation"
import { authRoutes } from "@/lib/auth/constants"

export default function RegisterRedirect() {
  redirect(authRoutes.signUp[0])
}
