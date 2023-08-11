"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useApiStore } from "@/contexts/api.store"
import { logger } from "@/lib/logger"
import { UpdateUserSchema } from "@/types/api"
import NeedSavePopup from "../need-save-popup"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"
import { toast } from "../ui/use-toast"

//? Put only the fields you can update withou password confirmation
export const nonSensibleSchema = UpdateUserSchema

export type INonSensibleForm = z.infer<typeof nonSensibleSchema>

export default function UpdateAccount({
  dictionary,
}: {
  dictionary: {
    username: {
      label: string
      placeholder: string
    }
    error: string
    needSavePopup: string
    reset: string
    saveChanges: string
  }
}) {
  const { data: curSession, update } = useSession()
  const router = useRouter()
  const apiFetch = useApiStore((state) => state.apiFetch(router))

  const [isNotSensibleInformationsUpdated, setIsNotSensibleInformationsUpdated] = useState<boolean>(false)

  const form = useForm<INonSensibleForm>({
    resolver: zodResolver(nonSensibleSchema),
    defaultValues: {
      username: curSession?.user?.name || "",
    },
  })

  const resetForm = useCallback(() => {
    logger.debug("Resetting form with", curSession?.user)
    form.reset({
      username: curSession?.user.username ?? "",
    })
  }, [curSession?.user, form])

  useEffect(() => {
    if (!curSession) return
    resetForm()
  }, [curSession, resetForm])

  if (form.formState.isDirty && !isNotSensibleInformationsUpdated) {
    setIsNotSensibleInformationsUpdated(true)
  } else if (!form.formState.isDirty && isNotSensibleInformationsUpdated) {
    setIsNotSensibleInformationsUpdated(false)
  }

  async function onUpdateNonSensibleInforation(data: INonSensibleForm) {
    const res = await apiFetch(
      fetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
      (err) => {
        toast({
          title: dictionary.error,
          description: err,
          variant: "destructive",
        })
      }
    )
    if (res) {
      //? Update the session
      await update()
    }
  }

  return (
    <div className="mt-3 flex flex-col space-y-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onUpdateNonSensibleInforation)} className="grid gap-2">
          <div className="grid gap-1">
            <FormField
              label={dictionary.username.label}
              placeholder={dictionary.username.placeholder}
              type="text"
              disabled={form.formState.isSubmitting || !curSession}
              form={form}
              name="username"
            />
          </div>
          <NeedSavePopup
            show={isNotSensibleInformationsUpdated}
            onReset={resetForm}
            isSubmitting={form.formState.isSubmitting}
            text={dictionary.needSavePopup}
            dictionary={dictionary}
          />
        </form>
      </Form>
    </div>
  )
}
