import { exec } from "child_process"
import fs from "fs-extra"
import { globby } from "globby"
import path from "path"
import * as tar from "tar"
import { z } from "zod"

import { configSchema, storeConfigSchema } from "@next-boilerplate/scripts/utils/template-config"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

export const fullStoreSchema = storeConfigSchema.extend({
  fullPath: z.string(),
})

export type TStoreStore = z.infer<typeof fullStoreSchema>

type TConfig = z.infer<typeof storeConfigSchema>

const configFileName = "config.json"
const getStoresDirectory = (assetsDirectory: string) => path.join(assetsDirectory, "stores")

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const optionalConfigSchema = configSchema.partial()

const loadStores = async ({ assetsDirectory }: { assetsDirectory: string }) => {
  const storesDirectory = getStoresDirectory(assetsDirectory)
  logger.debug(`Loading stores (${storesDirectory})`)
  await fs.ensureDir(storesDirectory)

  //* Get all the stores
  const formattedStoresDirectory = storesDirectory.replace(/\\/g, "/")
  const globbyPath = path.join(formattedStoresDirectory, "*", configFileName).replace(/\\/g, "/")
  const stores = await globby(globbyPath)
  logger.debug(`Found ${stores.length} stores in ${globbyPath}`)
  const storesFilled: TStoreStore[] = []

  //* Validate their config
  for (const store of stores) {
    const storeConfig = (await fs.readJson(store)) as TConfig

    try {
      storeConfigSchema.parse(storeConfig)
    } catch (error) {
      logger.error(error)
      throw new TRPCError({
        message: `The config of the store ${store} is invalid`,
        code: "INTERNAL_SERVER_ERROR",
      })
    }

    const fullPath = path.dirname(store)
    storesFilled.push({ ...storeConfig, fullPath })
  }

  storesFilled.sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`))

  return storesFilled
}

export const getStores = async (opts: { search?: string; assetsDirectory: string }) => {
  const stores = await loadStores({ assetsDirectory: opts.assetsDirectory })
  return stores.filter((store) => {
    if (!opts?.search) return true
    return `${store.name}@${store.version}`.toLowerCase().includes(opts.search.toLowerCase())
  })
}

//* Check for already installed store and download those not installed yet from npmjs
export const handleDownloadStores = async (
  config: z.infer<typeof optionalConfigSchema>,
  {
    assetsDirectory,
  }: {
    assetsDirectory: string
  }
) => {
  const stores = await getStores({ assetsDirectory })
  const storeToDownload = config.stores?.filter(
    (store) => !stores.some((s) => s.name === store.name && s.version === store.version)
  )

  if (!storeToDownload || storeToDownload.length === 0) {
    return
  }
  logger.info(`Downloading stores: ${storeToDownload?.map((s) => s.name).join(", ")}`)
  // Folder tree
  // stores
  //  - %next-boilerplate%2Fcli (store name encoded)
  //    - config.json (store config)
  //    - data (folder containing the store files)

  const npmVersion = await new Promise<string>((resolve, reject) => {
    exec("npm --version", (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout)
    })
  }).catch((e) => {
    logger.error(`Failed to get the npm version`, e)
    throw new TRPCError({
      message: `Failed to get the npm version`,
      code: "INTERNAL_SERVER_ERROR",
    })
  })
  logger.debug(`npm version: ${npmVersion}`)

  for (const store of storeToDownload) {
    await handleDownloadStore(store, {
      assetsDirectory,
    })
  }
}

export const handleDownloadStore = async (
  store: z.infer<typeof storeConfigSchema>,
  { assetsDirectory, override }: { assetsDirectory: string; override?: boolean }
) => {
  const storesDirectory = getStoresDirectory(assetsDirectory)
  const storePath = path.join(storesDirectory, encodeURIComponent(store.name))
  const storeDataPath = path.join(storePath, "data")
  const storeConfigPath = path.join(storePath, configFileName)
  await fs.ensureDir(storePath)
  await fs.writeJson(storeConfigPath, store)

  // Check if the store is already installed
  if (!override && (await fs.exists(storeDataPath))) {
    logger.warn(`The store ${store.name}@${store.version} is already installed at ${storeDataPath}`)
    return
  }

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
    logger.error(`Failed to download the store ${store.name}@${store.version}`, e)
    // Also remove the store folder
    await fs.remove(storePath)
    throw new TRPCError({
      message: `Failed to download the store ${store.name}@${store.version}`,
      code: "INTERNAL_SERVER_ERROR",
    })
  })
}

export const handleDeleteStore = async (store: z.infer<typeof storeConfigSchema>, assetsDirectory: string) => {
  const storesDirectory = getStoresDirectory(assetsDirectory)
  const storePath = path.join(storesDirectory, encodeURIComponent(store.name))
  await fs.remove(storePath)
  logger.info(`Deleted the store ${store.name}@${store.version}`)
}
