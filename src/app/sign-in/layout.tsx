import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign-in",
  description: "Login to your account",
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
