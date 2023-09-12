import { z } from "zod"
import { usernameSchema } from "./auth"
import { TDictionary } from "../langs"

export const userSchema = (dictionary?: TDictionary) =>
  z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    emailVerified: z.date().nullable(),
    image: z.string().nullable(),
    username: usernameSchema(dictionary).nullable(),
    role: z.string(),
  })
