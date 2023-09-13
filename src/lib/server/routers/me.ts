import { updateUser } from "@/lib/api/me/mutation"
import { getAccount } from "@/lib/api/me/queries"
import { deleteSession } from "@/lib/api/me/sessions/mutation"
import { getActiveSessions } from "@/lib/api/me/sessions/queries"
import {
  deleteSessionResponseSchema,
  deleteSessionSchema,
  getAccountResponseSchema,
  getActiveSessionsResponseSchema,
  getActiveSessionsSchema,
  updateUserResponseSchema,
  updateUserSchema,
} from "@/lib/schemas/user"
import { authenticatedProcedure, router } from "../trpc"

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
})
