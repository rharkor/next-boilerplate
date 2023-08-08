import requireAuth from "@/components/auth/require-auth"
import { ThemeSwitch } from "@/components/theme/theme-switch"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAuth("/profile")

  return (
    <>
      {children}
      <div className="fixed right-2 top-2 z-10">
        <ThemeSwitch />
      </div>
    </>
  )
}
