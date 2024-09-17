import { z } from "zod"

// Name of the config file for a store
export const storeConfigFileName = "config.json"

/**
 * @description Regular expressions for validating store names and versions
 * @example
 * storeNameRegex.test('@my-scope/my-store') // true
 * storeNameRegex.test('my-store') // true
 * storeNameRegex.test('my-store@1.0.0') // false
 */
export const storeNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/

/**
 * @description Regular expression for validating store versions
 * @example
 * storeVersionRegex.test('1.0.0') // true
 * storeVersionRegex.test('^1.0.0') // true
 * storeVersionRegex.test('latest') // true
 * storeVersionRegex.test('1.0.0-alpha') // true
 */
export const storeVersionRegex = /^[~^]?[\da-z.-]+$/

/**
 * @description Regular expressions for validating an item with store, format: <store_name>@<version>/<item_path>
 * Group 1: store name
 * Group 2: store version
 * Group 3: item path
 * @example
 * matchItem.test('@my-scope/my-store@1.0.0/my-item') // true
 */
export const matchItem = /^((?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*)@([~^]?[\da-z.-]+)\/(.*)$/

/**
 * Schema for validating store used in configuration file.
 */
export const storeSchema = z.object({
  name: z.string().regex(storeNameRegex).max(100),
  version: z.string().regex(storeVersionRegex).max(100),
})

/**
 * Schema for validating the configuration of a store.
 */
export const storeConfigSchema = z.object({
  name: z.string().regex(storeNameRegex).max(100),
  version: z.string().regex(storeVersionRegex).max(100),
})

export type TStoreConfig = z.infer<typeof storeConfigSchema>

/**
 * Schema with additional properties.
 */
export const fullStoreSchema = storeConfigSchema.extend({
  uid: z.string(),
  fullPath: z.string(),
})

export type TFullStoreConfig = z.infer<typeof fullStoreSchema>

/**
 * Get the UID of a store.
 * @param store
 * @returns
 */
export const getStoreUID = (store: z.infer<typeof storeConfigSchema>) => `${store.name}@${store.version}`

/**
 * Get the UID of an item.
 * @param item
 * @returns
 */
export const getItemUID = (item: { name: string; store: z.infer<typeof storeConfigSchema> }) =>
  `${item.store.name}@${item.store.version}/${item.name}`

/**
 * Extract the store name and version from an item UID.
 * @param itemUID
 * @returns
 */
export const extractItemUID = (itemUID: string) => {
  const match = itemUID.match(matchItem)
  if (!match) {
    throw new Error(`Invalid item UID: ${itemUID}`)
  }

  return {
    store: {
      name: match[1],
      version: match[2],
    },
    name: match[3],
  }
}
