import * as z from "zod"
import { TDictionary } from "@/lib/langs"
import { usernameSchema } from "./constants"

export type IApiError = {
  status: "error"
  message: string
}

export const UpdateUserSchema = (dictionary?: TDictionary) =>
  z.object({
    username: usernameSchema(dictionary),
  })
