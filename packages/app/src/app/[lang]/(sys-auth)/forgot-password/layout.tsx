import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Enter your email to reset your password",
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
