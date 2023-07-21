"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import * as React from "react"

import { useForm } from "react-hook-form"
import * as z from "zod"
import { signUpSchema } from "@/types/auth"
import { Button } from "../ui/button"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"
import { Label } from "../ui/label"
import { toast } from "../ui/use-toast"

type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement> & {
  isMinimized?: boolean
}

export const formSchema = signUpSchema.extend({
  confirmPassword: z.string(),
})

export const formMinizedSchema = signUpSchema.pick({
  email: true,
})

export const getFormSchema = (isMinimized?: boolean) => (isMinimized ? formMinizedSchema : formSchema)

export type IForm = z.infer<typeof formSchema>
export type IFormMinimized = z.infer<typeof formMinizedSchema>

export function RegisterUserAuthForm({ isMinimized, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const router = useRouter()

  const form = useForm<IForm | IFormMinimized>({
    resolver: zodResolver(getFormSchema(isMinimized)),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  })

  function onSubmit(data: IForm | IFormMinimized) {
    if (isMinimized) {
      return router.push("/sign-up/credentials")
    }
    setIsLoading(true)
    toast({
      title: "Success",
      description: (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ),
    })
    setIsLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <FormField
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              form={form}
              name="email"
            />
          </div>
          {!isMinimized && (
            <>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="username">
                  Username
                </Label>
                <FormField
                  placeholder="Username"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect="off"
                  disabled={isLoading}
                  form={form}
                  name="username"
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="password">
                  Password
                </Label>
                <FormField
                  placeholder="Password"
                  type="password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  disabled={isLoading}
                  form={form}
                  name="password"
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="confirmPassword">
                  Confirm Password
                </Label>
                <FormField
                  placeholder="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  disabled={isLoading}
                  form={form}
                  name="confirmPassword"
                />
              </div>
            </>
          )}
          <Button type="submit" isLoading={isLoading}>
            Sign Up With Email
          </Button>
        </div>
      </form>
    </Form>
  )
}
