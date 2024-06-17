import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { PickFromSubset, SelectSubset } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pickFromSubset<T extends object, K extends SelectSubset<T>>(
  obj: T,
  subset: K,
  keySum?: string
): PickFromSubset<T, K> {
  const result = {} as PickFromSubset<T, K>
  if (!subset) {
    // throw new Error("The subset is undefined. Please provide a subset to pick from the dictionary.")
    return obj as PickFromSubset<T, K>
  }
  Object.keys(subset).forEach((_key) => {
    const key = _key as keyof typeof subset
    if (!obj[key as keyof T]) {
      throw new Error(
        `The key "${(keySum ? keySum + "." : "") + key.toString()}" not found in dictionary. Maybe you forgot to import it from the server component. see the docs for more information.`
      )
    }
    if (subset[key] === true) {
      result[key] = obj[key as keyof T] as PickFromSubset<T, K>[keyof K]
    } else if (typeof subset[key] === "object") {
      result[key] = pickFromSubset(
        obj[key as keyof T] as object,
        subset[key] as SelectSubset<T[keyof T]>,
        keySum ? keySum + "." + key.toString() : key.toString()
      ) as PickFromSubset<T, K>[keyof K]
    }
  })
  return result
}

export function merge<T extends object, R extends object[]>(target: T, ...sources: R): T & R[number] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isObject = (obj: any): obj is object => !!obj && typeof obj === "object" && !Array.isArray(obj)

  const mergeTwo = <T extends object, K extends object>(target: T, source: K): T & K => {
    if ((target as T | boolean) === true) return true as unknown as T & K
    const output = { ...target }
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((_key) => {
        const key = _key as keyof typeof source
        if (isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] })
          else
            output[key as unknown as keyof T] = mergeTwo(
              target[key as unknown as keyof T] as object,
              source[key] as object
            ) as T[keyof T]
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }
    return output as T & K
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return sources.reduce((acc, curr) => mergeTwo(acc, curr as any), target) as T
}
