"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useAccount } from "@/contexts/account"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { updateUserSchema } from "@/lib/schemas/user"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"
import NeedSavePopup from "../need-save-popup"
import { Form } from "../ui/form"
import FormField from "../ui/form-field"

//? Put only the fields you can update withou password confirmation
const nonSensibleSchema = updateUserSchema

type INonSensibleForm = z.infer<ReturnType<typeof nonSensibleSchema>>

export default function UpdateAccount({ dictionary }: { dictionary: TDictionary }) {
  const router = useRouter()
  const utils = trpc.useContext()

  const { update } = useSession()
  const account = useAccount(dictionary)

  const updateUserMutation = trpc.me.updateUser.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
    onSuccess: async () => {
      logger.debug("User updated")
      await update()
      utils.me.getAccount.invalidate()
    },
  })

  const [isNotSensibleInformationsUpdated, setIsNotSensibleInformationsUpdated] = useState<boolean>(false)

  const form = useForm<INonSensibleForm>({
    resolver: zodResolver(nonSensibleSchema(dictionary)),
    defaultValues: {
      username: account.data?.user.name || "",
    },
  })

  const resetForm = useCallback(() => {
    form.reset({
      username: account.data?.user.username ?? "",
    })
  }, [account.data?.user, form])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  if (form.formState.isDirty && !isNotSensibleInformationsUpdated) {
    setIsNotSensibleInformationsUpdated(true)
  } else if (!form.formState.isDirty && isNotSensibleInformationsUpdated) {
    setIsNotSensibleInformationsUpdated(false)
  }

  async function onUpdateNonSensibleInforation(data: INonSensibleForm) {
    updateUserMutation.mutate(data)
  }

  return (
    <div className="mt-3 flex flex-col space-y-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onUpdateNonSensibleInforation)} className="grid gap-2">
          <div className="grid gap-1">
            <FormField
              label={dictionary.profilePage.profileDetails.username.label}
              placeholder={dictionary.profilePage.profileDetails.username.placeholder}
              type="text"
              disabled={updateUserMutation.isLoading || !account.isFetched}
              form={form}
              name="username"
            />
          </div>
          <NeedSavePopup
            show={isNotSensibleInformationsUpdated}
            onReset={resetForm}
            isSubmitting={updateUserMutation.isLoading}
            text={dictionary.needSavePopup}
            dictionary={dictionary}
          />
        </form>
      </Form>
    </div>
  )
}
