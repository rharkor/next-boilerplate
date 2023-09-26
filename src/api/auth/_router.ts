import { signUpResponseSchema, signUpSchema } from "@/lib/schemas/auth"
import { publicProcedure, router } from "@/lib/server/trpc"
import { register } from "./mutations"

export const authRouter = router({
  register: publicProcedure.input(signUpSchema()).output(signUpResponseSchema()).mutation(register),
})
