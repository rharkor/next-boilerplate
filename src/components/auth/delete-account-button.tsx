"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { authRoutes } from "@/lib/auth/constants"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { handleMutationError } from "@/lib/utils/client-utils"
import { Button } from "../ui/button"

export default function DeleteAccountButton({
  children,
  dictionary,
}: {
  children: React.ReactNode
  dictionary: TDictionary
}) {
  const router = useRouter()
  const deleteAccountMutation = trpc.me.deleteAccount.useMutation({
    onError: (error) => {
      handleMutationError(error, dictionary, router)
      setIsDeletingAccount(false)
    },
    onSuccess: () => {
      toast.success(dictionary.deleteAccountSuccessDescription)
      router.push(authRoutes.signIn[0])
    },
  })

  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const handleDeleteAccount = () => {
    setIsDeletingAccount(true)
    deleteAccountMutation.mutate()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" isLoading={isDeletingAccount}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dictionary.deleteAccountConfirmationTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dictionary.deleteAccountConfirmationDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{dictionary.cancel}</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDeleteAccount} isLoading={isDeletingAccount}>
            {dictionary.deleteAccountConfirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
