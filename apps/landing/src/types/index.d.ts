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

export type Expand<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T

export type UnionToIntersection<U> = Expand<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
>
