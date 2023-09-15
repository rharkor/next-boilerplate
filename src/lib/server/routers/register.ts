import { register } from "@/lib/api/auth/mutations"
import { signUpResponseSchema, signUpSchema } from "@/lib/schemas/auth"
import { publicProcedure, router } from "../trpc"

export const authRouter = router({
  register: publicProcedure.input(signUpSchema()).output(signUpResponseSchema()).mutation(register),
})
