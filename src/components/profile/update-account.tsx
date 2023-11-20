"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useAccount } from "@/contexts/account"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { getAccountResponseSchema, updateUserSchema } from "@/lib/schemas/user"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"
import UpdateAvatar from "./avatar"
import FormField from "../ui/form"
import NeedSavePopup from "../ui/need-save-popup"

//? Put only the fields you can update withou password confirmation
const nonSensibleSchema = updateUserSchema

type INonSensibleForm = z.infer<ReturnType<typeof nonSensibleSchema>>

export default function UpdateAccount({
  dictionary,
  serverAccount,
}: {
  dictionary: TDictionary
  serverAccount: z.infer<ReturnType<typeof getAccountResponseSchema>>
}) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const { update } = useSession()
  const account = useAccount(dictionary, {
    initialData: serverAccount,
  })
  const hasVerifiedEmail = !!account.data?.user.emailVerified

  const updateUserMutation = trpc.me.updateUser.useMutation({
    onError: (error) => handleMutationError(error, dictionary, router),
    onSuccess: async (data) => {
      logger.debug("User updated")
      await update()
      utils.me.getAccount.invalidate()
      form.reset({
        username: data.user.username ?? "",
      })
    },
  })

  const [isNotSensibleInformationsUpdated, setIsNotSensibleInformationsUpdated] = useState<boolean>(false)

  const form = useForm<INonSensibleForm>({
    resolver: zodResolver(nonSensibleSchema(dictionary)),
    defaultValues: {
      username: account.data?.user.username || "",
    },
  })

  const resetForm = useCallback(() => {
    form.reset({
      username: account.data?.user.username ?? "",
    })
  }, [account.data?.user, form])

  if (form.formState.isDirty && !isNotSensibleInformationsUpdated) {
    setIsNotSensibleInformationsUpdated(true)
  } else if (!form.formState.isDirty && isNotSensibleInformationsUpdated) {
    setIsNotSensibleInformationsUpdated(false)
  }

  async function onUpdateNonSensibleInforation(data: INonSensibleForm) {
    if (!hasVerifiedEmail) return
    updateUserMutation.mutate(data)
  }

  return (
    <div className="relative mt-3 flex flex-row items-center gap-3">
      <UpdateAvatar account={account} dictionary={dictionary} />
      <div className="flex flex-1 flex-col gap-2">
        <form onSubmit={form.handleSubmit(onUpdateNonSensibleInforation)} className="grid gap-2">
          <FormField
            form={form}
            name="username"
            label={dictionary.profilePage.profileDetails.username.label}
            placeholder={dictionary.profilePage.profileDetails.username.placeholder}
            type="text"
            disabled={updateUserMutation.isLoading || account.isInitialLoading || !hasVerifiedEmail}
          />
          <NeedSavePopup
            show={isNotSensibleInformationsUpdated}
            onReset={resetForm}
            isSubmitting={updateUserMutation.isLoading}
            text={dictionary.needSavePopup}
            dictionary={dictionary}
          />
        </form>
      </div>
      {!hasVerifiedEmail && (
        <div className="absolute -inset-2 z-10 !m-0 flex items-center justify-center backdrop-blur-sm">
          <p className="text-center text-sm font-semibold text-muted-foreground">
            {dictionary.errors.emailNotVerified}
          </p>
        </div>
      )}
    </div>
  )
}
