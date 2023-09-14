import { deleteAccount, updateUser } from "@/lib/api/me/mutation"
import { forgotPassword, resetPassword } from "@/lib/api/me/password/mutation"
import { getAccount } from "@/lib/api/me/queries"
import { deleteSession } from "@/lib/api/me/sessions/mutation"
import { getActiveSessions } from "@/lib/api/me/sessions/queries"
import {
  deleteAccountResponseSchema,
  deleteSessionResponseSchema,
  deleteSessionSchema,
  forgotPasswordResponseSchema,
  forgotPasswordSchema,
  getAccountResponseSchema,
  getActiveSessionsResponseSchema,
  getActiveSessionsSchema,
  resetPasswordResponseSchema,
  resetPasswordSchema,
  updateUserResponseSchema,
  updateUserSchema,
} from "@/lib/schemas/user"
import { authenticatedProcedure, publicProcedure, router } from "../trpc"

export const meRouter = router({
  updateUser: authenticatedProcedure.input(updateUserSchema()).output(updateUserResponseSchema()).mutation(updateUser),
  getActiveSessions: authenticatedProcedure
    .input(getActiveSessionsSchema())
    .output(getActiveSessionsResponseSchema())
    .query(getActiveSessions),
  deleteSession: authenticatedProcedure
    .input(deleteSessionSchema())
    .output(deleteSessionResponseSchema())
    .mutation(deleteSession),
  getAccount: authenticatedProcedure.output(getAccountResponseSchema()).query(getAccount),
  deleteAccount: authenticatedProcedure.output(deleteAccountResponseSchema()).mutation(deleteAccount),
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema())
    .output(forgotPasswordResponseSchema())
    .mutation(forgotPassword),
  resetPassword: publicProcedure
    .input(resetPasswordSchema())
    .output(resetPasswordResponseSchema())
    .mutation(resetPassword),
})
