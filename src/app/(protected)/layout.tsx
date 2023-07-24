import requireAuth from "@/components/auth/require-auth"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/profile")

  return <>{children}</>
}
