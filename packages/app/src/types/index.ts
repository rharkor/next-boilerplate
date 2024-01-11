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

export type ValueOf<T> = T[keyof T]

export const isPossiblyUndefined = <T>(value: T): T | undefined => value

export type Path<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? `${Prefix}${Prefix extends "" ? "" : "."}${K}` | Path<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${K}`>
        : never
    }[keyof T]
  : never
