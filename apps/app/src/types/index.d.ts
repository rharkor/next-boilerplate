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

/**
 * Get the path of a deeply nested object
 * @example
 * type Obj = {
 *  a: {
 *   b: {
 *    c: string
 *   }
 *  }
 * }
 * type Result = Path<Obj> // "a" | "a.b" | "a.b.c"
 */
export type Path<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? `${Prefix}${Prefix extends "" ? "" : "."}${K}` | Path<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${K}`>
        : never
    }[keyof T]
  : never

/**
 * SelectSubset of an object
 * @example
 * type Obj = {
 *  a: string
 *  b: number
 *  c: {
 *   d: boolean
 *  }
 * }
 * type Result = SelectSubset<Obj> // { a?: boolean, b?: boolean, c?: { d?: boolean } | boolean }
 */
export type SelectSubset<T> = {
  [K in keyof T]?: T[K] extends object ? SelectSubset<T[K]> | boolean : boolean
}

/**
 * PickFromSubset of an object
 * @example
 * type Obj = {
 *  a: string
 *  b: number
 *  c: {
 *   d: boolean
 *  }
 * }
 * const subset: SelectSubset<Obj> = { a: true, c: true }
 * type Result = PickFromSubset<Obj, typeof subset> // { a: string, c: { d: boolean } }
 */
export type PickFromSubset<T, S extends SelectSubset<T>> = {
  [K in keyof S]-?: S[K] extends true ? T[K] : S[K] extends object ? PickFromSubset<T[K], S[K]> : never
}
