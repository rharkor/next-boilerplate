// This type will transform all the dictionary values into functions that return the value
export type DictionaryWithFunction<T extends object> = {
  [K in keyof T]: T[K] extends string
    ? (params?: { [key: string]: string }) => string
    : T[K] extends object
      ? DictionaryWithFunction<T[K]>
      : never
}

export const transformDictionaryWithFunction = <T extends object>(dictionary: T): DictionaryWithFunction<T> => {
  const result = {} as DictionaryWithFunction<T>
  for (const key in dictionary) {
    const value = dictionary[key]
    if (typeof value === "string") {
      result[key] = ((params?: { [key: string]: string }) => {
        let result = value
        if (params) {
          for (const paramKey in params) {
            result = result.replaceAll(`{${paramKey}}`, params[paramKey]) as T[Extract<keyof T, string>] & string
          }
        }
        return result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
    } else if (typeof value === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = transformDictionaryWithFunction(value as object) as any
    }
  }
  return result
}
