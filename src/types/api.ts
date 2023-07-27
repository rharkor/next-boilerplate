import * as z from "zod"
import { usernameSchema } from "./constants"

export type IApiError = {
  status: "error"
  message: string
}

export const UpdateUserSchema = z.object({
  username: usernameSchema,
})
