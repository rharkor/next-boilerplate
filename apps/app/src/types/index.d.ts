import { Session } from "next-auth"
import { z } from "zod"

export type ITrpcContext = {
  session: Session | null | undefined
  headers: { [k: string]: string } | null | undefined
  req: Request | null | undefined
  fromServer?: boolean
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
export type Path<T extends object, Prefix extends string = ""> = {
  [K in keyof T]-?: K extends string
    ? T[K] extends object
      ? `${Prefix}${Prefix extends "" ? "" : "."}${K}` | Path<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${K}`>
      : `${Prefix}${Prefix extends "" ? "" : "."}${K}`
    : never
}[keyof T]

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

/**
 * SubsetFromPick of an object (reverse of the above type)
 * @example
 * type Pick = { a: string, c: { d: boolean } }
 * type Result = SubsetFromPick<Pick> // { a: true, c: { d: true } }
 */
export type SubsetFromPick<T extends object> = {
  [K in keyof T]-?: T[K] extends object ? SubsetFromPick<T[K]> : true
}

/**
 * Remove undefined recursively from an object
 * @example
 * type Obj = {
 *  a: string
 *  b: undefined
 *  c: {
 *   d: undefined
 *   e: boolean
 *  }
 * }
 * type Result = RemoveUndefined<Obj> // { a: string, c: { e: boolean } }
 */
export type RemoveUndefined<T> = {
  [K in keyof T]-?: T[K] extends undefined ? never : T[K] extends object ? RemoveUndefined<T[K]> : T[K]
}

/**
 * ExtractDictionaryProps from a react component
 * @example
 * const Component = (props: { dictionary: TDictionary<{a: true}> }) => null
 * type Result = ExtractDictionaryProps<typeof Component> // { a: true }
 */
export type ExtractDictionaryFromProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (props: { dictionary: D } & any) => any,
  D extends TDictionary<S> = Parameters<T>["0"]["dictionary"],
  S extends SelectSubset<TBaseDict> | undefined = RemoveUndefined<SubsetFromPick<D>>,
> = S

export type Expand<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T

export type UnionToIntersection<U> = Expand<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
>
