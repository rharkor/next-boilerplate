import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recover 2FA",
  description: "Recover your account if you lost your 2FA device",
}

export default function Recover2FALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
