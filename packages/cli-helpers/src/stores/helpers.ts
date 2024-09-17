import { exec } from "child_process"
import fs from "fs-extra"
import { globby } from "globby"
import path from "path"
import * as tar from "tar"
import { z } from "zod"

import { logger } from "@rharkor/logger"

import { TOptionalConfig } from "../config"

import { storeConfigFileName, storeConfigSchema, TFullStoreConfig, TStoreConfig } from "."

/**
 * Get the stores directory path relative to the assets directory.
 * @param assetsDirectory
 * @returns
 */
export const getStoresDirectory = (assetsDirectory: string) => path.join(assetsDirectory, "stores")

export const getStoreDataDirectory = ({ assetsDirectory, store }: { assetsDirectory: string; store: TStoreConfig }) =>
  path.join(getStoresDirectory(assetsDirectory), encodeURIComponent(getStoreUID(store)), "data")

/**
 * Get the UID of a store.
 * @param store
 * @returns
 */
export const getStoreUID = (store: z.infer<typeof storeConfigSchema>) => `${store.name}@${store.version}`

/**
 * Load the stores from the assets directory.
 * @param param0
 * @returns
 */
const loadStores = async ({ assetsDirectory }: { assetsDirectory: string }) => {
  const storesDirectory = getStoresDirectory(assetsDirectory)
  logger.debug(`Loading stores (${storesDirectory})`)

  //* Ensure the stores directory exists
  await fs.ensureDir(storesDirectory)

  //* Get all the stores
  const formattedStoresDirectory = storesDirectory.replace(/\\/g, "/")
  const globbyPath = path.join(formattedStoresDirectory, "*", storeConfigFileName).replace(/\\/g, "/")
  const stores = await globby(globbyPath)
  logger.debug(`Found ${stores.length} stores in ${globbyPath}`)
  const storesFilled: TFullStoreConfig[] = []

  //* Validate their config
  for (const store of stores) {
    const { data: storeConfig, error } = storeConfigSchema.safeParse(await fs.readJson(store))

    if (error) {
      logger.error(error)
      throw new Error(`The config of the store ${store} is invalid`)
    }

    // Get the full path of the store
    const fullPath = path.dirname(store)
    // Add the store to the list
    storesFilled.push({ ...storeConfig, fullPath, uid: getStoreUID(storeConfig) })
  }

  // Sort the stores by name and version
  storesFilled.sort((a, b) => getStoreUID(a).localeCompare(getStoreUID(b)))

  return storesFilled
}

/**
 * Get the stores from the assets directory.
 * @param opts
 * @returns
 */
export const getStores = async ({ assetsDirectory, search }: { search?: string; assetsDirectory: string }) => {
  let stores = await loadStores({ assetsDirectory })

  // Filter the stores by search
  if (search) {
    stores = stores.filter((store) => {
      return getStoreUID(store).toLowerCase().includes(search.toLowerCase())
    })
  }

  return stores
}

/**
 * Check for already installed store and download those not installed yet from npmjs
 * @param config
 * @param param1
 * @returns
 */
export const handleDownloadStores = async ({
  assetsDirectory,
  config,
}: {
  assetsDirectory: string
  config: TOptionalConfig
}) => {
  // Get the stores from the assets directory
  const stores = await getStores({ assetsDirectory })

  // Get the stores to download
  const storeToDownload = config.stores?.filter((store) => !stores.some((s) => getStoreUID(s) === getStoreUID(store)))

  if (!storeToDownload || storeToDownload.length === 0) {
    return
  }

  logger.info(`Downloading stores: ${storeToDownload?.map((s) => s.name).join(", ")}`)

  //* Folder tree
  // stores
  //  - %next-boilerplate%2Fcli (store name encoded)
  //    - config.json (store config)
  //    - data (folder containing the store files)

  // Check if npm is installed
  const npmVersion = await new Promise<string>((resolve, reject) => {
    exec("npm --version", (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })
  }).catch((e) => {
    logger.error(`Failed to get the npm version`)
    throw e
  })
  logger.debug(`npm version: ${npmVersion}`)

  // Download the stores
  for (const store of storeToDownload) {
    await handleDownloadStore({
      assetsDirectory,
      store,
    })
  }
}

/**
 * Download a store from npmjs and extract it.
 * @param store
 * @param param1
 * @returns
 */
export const handleDownloadStore = async ({
  assetsDirectory,
  override,
  store,
}: {
  assetsDirectory: string
  override?: boolean
  store: z.infer<typeof storeConfigSchema>
}) => {
  const storesDirectory = getStoresDirectory(assetsDirectory)
  //? We encode the store name to avoid issues with special characters like / in the store name
  const storePath = path.join(storesDirectory, encodeURIComponent(getStoreUID(store)))
  // Where the store data will be stored
  const storeDataPath = path.join(storePath, "data")
  // Store installation config path
  const storeConfigPath = path.join(storePath, storeConfigFileName)

  // Ensure the store folder exists
  await fs.ensureDir(storePath)
  // Save the store installation config
  await fs.writeJson(storeConfigPath, store)

  // Check if the store is already installed
  if (!override && (await fs.exists(storeDataPath))) {
    logger.warn(`The store ${store.name}@${store.version} is already installed at ${storeDataPath}`)
    return
  }

  // Ensure the store data folder exists
  //? Created after the check to avoid triggering the warning
  await fs.ensureDir(storeDataPath)

  //* Download the store (from npmjs)
  await new Promise<void>((resolve, reject) => {
    exec(`npm pack ${store.name}@${store.version}`, { cwd: storePath }, async (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      try {
        // Rename the tarball file
        const tarball = stdout.trim()
        const tarballPath = path.join(storePath, tarball)
        // Extract the tarball
        await tar.x({ file: tarballPath, cwd: storeDataPath, strip: 1 })
        // Remove the tarball
        await fs.remove(tarballPath)
        logger.debug(`Downloaded the store ${store.name}@${store.version}`)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }).catch(async (e) => {
    logger.error(`Failed to download the store ${store.name}@${store.version}`)
    // Also remove the store folder
    await fs.remove(storePath).catch((e) => {
      logger.error(`Failed to remove the store folder ${storePath}`)
      throw e
    })
    throw e
  })
}

/**
 * Delete a store from the assets directory.
 * @param store
 * @param assetsDirectory
 */
export const handleDeleteStore = async ({
  assetsDirectory,
  store,
}: {
  store: z.infer<typeof storeConfigSchema>
  assetsDirectory: string
}) => {
  const storesDirectory = getStoresDirectory(assetsDirectory)
  //? We encode the store name to avoid issues with special characters like / in the store name
  const storePath = path.join(storesDirectory, encodeURIComponent(getStoreUID(store)))
  // Remove the store folder
  await fs.remove(storePath)
  logger.info(`Deleted the store ${store.name}@${store.version}`)
}
