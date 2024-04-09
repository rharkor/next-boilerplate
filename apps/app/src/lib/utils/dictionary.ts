// This type will transform all the dictionary values into functions that return the value
export type DictionaryWithFunction<T extends object> = {
  [K in keyof T]: T[K] extends string
    ? (params?: { [key: string]: string }) => string
    : T[K] extends object
      ? DictionaryWithFunction<T[K]>
      : never
}

export const transformDictionaryWithFunction = <T extends object>(dictionary: T): DictionaryWithFunction<T> => {
  // The proxy handler can be usefull if we do not validate the dictionary keys and have unexpected error when trying to access a key that does not exist
  // But for now the dictionary is validated so we do not need it
  //// const proxyHandler: ProxyHandler<DictionaryWithFunction<T>> = {
  ////   get: (target, prop, receiver) => {
  ////     if (prop in target) {
  ////       return Reflect.get(target, prop, receiver)
  ////     } else {
  ////       return () => {
  ////         throw new Error(
  ////           `The key "${prop.toString()}" not found in dictionary. Maybe you forgot to import it from the server component. see the docs for more information.`
  ////         )
  ////       }
  ////     }
  ////   },
  //// }
  //// const createProxy = (obj: DictionaryWithFunction<T>) => {
  ////   for (const key in obj) {
  ////     if (typeof obj[key] === "object") {
  ////       obj[key] = createProxy(obj[key] as DictionaryWithFunction<T>) as (typeof obj)[typeof key]
  ////     }
  ////   }
  ////   return new Proxy(obj, proxyHandler)
  //// }

  const result = {} as DictionaryWithFunction<T>
  for (const key in dictionary) {
    const value = dictionary[key]
    if (typeof value === "string") {
      result[key] = ((params?: { [key: string]: string }) => {
        let res = value
        if (params) {
          for (const paramKey in params) {
            res = res.replaceAll(`{${paramKey}}`, params[paramKey]) as T[Extract<keyof T, string>] & string
          }
        }
        return res
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
    } else if (typeof value === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = transformDictionaryWithFunction(value as object) as any
    }
  }
  //// return createProxy(result)
  return result
}
