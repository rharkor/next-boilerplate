import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify your email using the token sent to your email",
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
