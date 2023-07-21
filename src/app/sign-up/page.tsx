import Link from "next/link"
import { RegisterUserAuthForm } from "@/components/auth/register-user-auth-form"
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SignUpPage() {
  return (
    <main className="container relative grid flex-1 flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/examples/authentication"
        className={cn(buttonVariants({ variant: "ghost" }), "absolute right-4 top-4 md:right-8 md:top-8")}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex ">
        <div className="absolute inset-0 bg-zinc-900" />
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your email below to create your account</p>
          </div>
          <div className="grid gap-6">
            <RegisterUserAuthForm isMinimized />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" type="button">
              <Icons.gitHub className="mr-2 h-4 w-4" />
              Github
            </Button>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
