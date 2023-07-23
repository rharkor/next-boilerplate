//! Only client-side code

import { toast } from "@/components/ui/use-toast"

export const handleSignError = (error: string) => {
  if (error == "OAuthAccountNotLinked") {
    toast({
      title: "Error",
      description: "You already have an account. Please sign in with your provider.",
      variant: "destructive",
    })
  } else {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    })
  }
}
