import { Session } from "next-auth"
import { z } from "zod"

export type ITrpcContext = {
  session: Session | null | undefined
  headers: { [k: string]: string } | null | undefined
  req: Request | null | undefined
}

export type apiInputFromSchema<T extends (() => z.Schema) | undefined> = {
  input: T extends () => z.Schema ? z.infer<ReturnType<T>> : unknown
  ctx: ITrpcContext
}
