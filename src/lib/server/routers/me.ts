import { sendVerificationEmail, verifyEmail } from "@/lib/api/me/email/mutation"
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
  sendVerificationEmailResponseSchema,
  sendVerificationEmailSchema,
  updateUserResponseSchema,
  updateUserSchema,
  verifyEmailResponseSchema,
  verifyEmailSchema,
} from "@/lib/schemas/user"
import { authenticatedNoEmailVerificationProcedure, authenticatedProcedure, publicProcedure, router } from "../trpc"

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
  getAccount: authenticatedNoEmailVerificationProcedure.output(getAccountResponseSchema()).query(getAccount),
  deleteAccount: authenticatedNoEmailVerificationProcedure
    .output(deleteAccountResponseSchema())
    .mutation(deleteAccount),
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema())
    .output(forgotPasswordResponseSchema())
    .mutation(forgotPassword),
  resetPassword: publicProcedure
    .input(resetPasswordSchema())
    .output(resetPasswordResponseSchema())
    .mutation(resetPassword),
  sendVerificationEmail: authenticatedNoEmailVerificationProcedure
    .input(sendVerificationEmailSchema())
    .output(sendVerificationEmailResponseSchema())
    .mutation(sendVerificationEmail),
  verifyEmail: authenticatedNoEmailVerificationProcedure
    .input(verifyEmailSchema())
    .output(verifyEmailResponseSchema())
    .mutation(verifyEmail),
})
