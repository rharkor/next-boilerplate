import {
  desactivateTotpResponseSchema,
  desactivateTotpSchema,
  generateTotpSecretResponseSchema,
  recover2FAResponseSchema,
  recover2FASchema,
  signUpSchema,
  verifyTotpResponseSchema,
  verifyTotpSchema,
} from "@/api/auth/schemas"
import { authenticatedProcedure, publicProcedure, router } from "@/lib/server/trpc"

import { signUpResponseSchema } from "../me/schemas"

import { desactivateTotp, generateTotpSecret, recover2FA, register, verifyTotp } from "./mutations"

export const authRouter = router({
  register: publicProcedure.input(signUpSchema()).output(signUpResponseSchema()).mutation(register),
  generateTotpSecret: authenticatedProcedure.output(generateTotpSecretResponseSchema()).mutation(generateTotpSecret),
  verifyTotp: authenticatedProcedure.input(verifyTotpSchema()).output(verifyTotpResponseSchema()).mutation(verifyTotp),
  desactivateTotp: authenticatedProcedure
    .input(desactivateTotpSchema())
    .output(desactivateTotpResponseSchema())
    .mutation(desactivateTotp),
  recover2FA: publicProcedure.input(recover2FASchema()).output(recover2FAResponseSchema()).mutation(recover2FA),
})
