"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"

import FormField from "@/components/ui/form"
import { useDictionary } from "@/contexts/dictionary/utils"
import { authRoutes } from "@/lib/auth/constants"
import { recover2FASchema } from "@/lib/schemas/auth"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/react"

const formSchema = recover2FASchema
type IForm = z.infer<ReturnType<typeof formSchema>>

export default function Recover2FAForm({ email }: { email?: string }) {
  const dictionary = useDictionary()
  const router = useRouter()

  const recover2FAMutation = trpc.auth.recover2FA.useMutation({
    onSuccess: () => {
      toast.success(dictionary.totp.totpDesactivated)
      router.push(authRoutes.signIn[0])
    },
  })

  const form = useForm<IForm>({
    resolver: zodResolver(formSchema(dictionary)),
    defaultValues: {
      email: email || "",
      mnemonic: "",
    },
  })

  async function onSubmit(data: IForm) {
    recover2FAMutation.mutate(data)
  }

  const isLoading = recover2FAMutation.isLoading

  const [mnemonic, setMnemonic] = useState(new Array(12).fill(""))
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value
    if (value === "") {
      const newMnemonic = [...mnemonic]
      newMnemonic[index] = value
      setMnemonic(newMnemonic)
      if (element.previousSibling) {
        ;(element.previousSibling as HTMLInputElement).focus()
      }
      return
    }
    const newMnemonic = [...mnemonic]
    newMnemonic[index] = element.value
    setMnemonic(newMnemonic)

    // Move to next input if there's a next input and current input is filled
    if (element.nextSibling && element.value) {
      ;(element.nextSibling as HTMLInputElement).focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData
      .getData("text")
      .split(" ")
      .filter((_, index) => index < mnemonic.length)
    if (pasteData.length === mnemonic.length) {
      setMnemonic(pasteData)
      // Focus the last input after pasting
      const lastInputField = document.querySelectorAll("input")[3]
      if (lastInputField) {
        lastInputField.focus()
      }
    }
  }

  const divRef = useRef<HTMLDivElement>(null)
  const mnemonicError = form.formState.errors.mnemonic

  useEffect(() => {
    form.setValue("mnemonic", mnemonic.join(" "))
  }, [mnemonic, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={"!mt-5 grid w-[350px] max-w-full gap-2"}>
      <FormField
        form={form}
        name="email"
        type="email"
        aria-label={dictionary.email}
        placeholder={dictionary.email}
        autoComplete="email"
      />
      <p className="text-muted-foreground mt-6 text-sm">{dictionary.recover2FADescription}</p>
      <div className="flex flex-col">
        <div className="grid grid-cols-3 gap-x-6 gap-y-2" ref={divRef}>
          {mnemonic.map((data, index) => {
            return (
              <div
                key={index}
                className={cn("relative", {
                  "before:absolute before:-left-3 before:-translate-x-1/2 before:content-['-'] before:max-[340px]:hidden":
                    index % 3,
                })}
              >
                <input
                  className={cn(
                    "bg-muted rounded-medium hover:bg-primary-200/70 focus:bg-primary-200/70 group relative h-[34px] w-full min-w-[70px] p-1.5 text-sm transition-all",
                    {
                      "bg-danger-50 hover:bg-danger-100": mnemonicError,
                    }
                  )}
                  type="text"
                  name={`mnemonic-${index}`}
                  placeholder={
                    index === 0
                      ? dictionary.mnemonic.write
                      : index === 1
                        ? dictionary.mnemonic.down
                        : index === 2
                          ? dictionary.mnemonic.your
                          : index === 3
                            ? dictionary.mnemonic.mnemonic
                            : index === 4
                              ? dictionary.mnemonic.phrase
                              : index === 5
                                ? dictionary.mnemonic.here
                                : ""
                  }
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && index !== 0 && !data) {
                      const prevInputField = divRef.current?.querySelectorAll("input")[index - 1]
                      if (prevInputField) {
                        prevInputField.focus()
                        e.preventDefault()
                      }
                    } else if (e.key === "ArrowLeft" && index !== 0) {
                      const prevInputField = divRef.current?.querySelectorAll("input")[index - 1]
                      if (prevInputField) {
                        prevInputField.focus()
                      }
                    } else if (e.key === "ArrowRight" && index !== 3) {
                      const nextInputField = divRef.current?.querySelectorAll("input")[index + 1]
                      if (nextInputField) {
                        nextInputField.focus()
                      }
                    } else if (e.key === "Space") {
                      e.preventDefault()
                      const nextInputField = divRef.current?.querySelectorAll("input")[index + 1]
                      if (nextInputField) {
                        nextInputField.focus()
                      }
                    }
                  }}
                />
              </div>
            )
          })}
        </div>
        {mnemonicError && (
          <div className="relative flex-col gap-1.5 p-1">
            <div className="text-tiny text-danger">{mnemonicError?.message}</div>
          </div>
        )}
      </div>
      <Button type="submit" color="primary" isLoading={isLoading} className="mt-2">
        {dictionary.reset}
      </Button>
    </form>
  )
}
