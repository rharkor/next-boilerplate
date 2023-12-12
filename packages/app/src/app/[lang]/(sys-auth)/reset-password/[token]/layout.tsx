import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your password using the token sent to your email",
}

export default function ResetPassword2FALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
