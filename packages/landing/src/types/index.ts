export type ValueOf<T> = T[keyof T]

export const isPossiblyUndefined = <T>(value: T): T | undefined => value
