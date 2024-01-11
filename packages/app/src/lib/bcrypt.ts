import { compare, hash as bhash } from "bcryptjs"
import crypto from "crypto-js"
import { env } from "env.mjs"

const PASSWORD_HASHER_SECRET = env.PASSWORD_HASHER_SECRET

export const hash = async (value: string, saltOrRounds: string | number) => {
  if (value.length > 100) throw new Error("Password too long")
  const preHashed = crypto.HmacSHA256(value, PASSWORD_HASHER_SECRET).toString()
  return await bhash(preHashed, saltOrRounds)
}

export const bcryptCompare = async (value: string, hash: string) => {
  if (value.length > 100) throw new Error("Value for password is too long")
  const preHashed = crypto.HmacSHA256(value, PASSWORD_HASHER_SECRET).toString()
  return compare(preHashed, hash)
}
