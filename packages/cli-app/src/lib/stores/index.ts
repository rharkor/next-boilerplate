import { exec } from "child_process"
import fs from "fs-extra"
import { globby } from "globby"
import path from "path"
import * as tar from "tar"

import { storeConfigSchema } from "@next-boilerplate/scripts/utils/template-config"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

export const fullStoreSchema = storeConfigSchema.extend({
  fullPath: z.string(),
})

export type TStoreStore = z.infer<typeof fullStoreSchema>

type TConfig = z.infer<typeof storeConfigSchema>

import { z } from "zod"

import { optionalConfigSchema } from "../configuration"
import { env } from "../env"

// Get the current package directory
const cwd = process.cwd()
// eslint-disable-next-line no-process-env
const dir = path.resolve(cwd, env.CLI_REL_PATH ?? "../..")

const configFileName = "config.json"
const storesDirectory = path.join(dir, "assets", "stores")

const loadStores = async () => {
  logger.debug(`Loading stores (${storesDirectory})`)
  if (!(await fs.exists(storesDirectory))) {
    throw new TRPCError({
      message: `The stores directory doesn't exist at ${storesDirectory}`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

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

export const getStores = async (opts?: { search?: string }) => {
  const stores = await new Promise<TStoreStore[]>(async (resolve) => {
    const stores = await loadStores()
    resolve(stores)
    return
  })
  return stores.filter((store) => {
    if (!opts?.search) return true
    return `${store.name}@${store.version}`.toLowerCase().includes(opts.search.toLowerCase())
  })
}

//* Check for already installed store and download those not installed yet from npmjs
export const handleDownloadStores = async (config: z.infer<typeof optionalConfigSchema>) => {
  const stores = await getStores()
  const storeToDownload = config.stores?.filter(
    (store) => !stores.some((s) => s.name === store.name && s.version === store.version)
  )

  if (!storeToDownload || storeToDownload.length === 0) {
    return
  }
  logger.info(`Downloading stores: ${storeToDownload?.map((s) => s.name).join(", ")}`)
  // Folder tree
  // stores
  //  - 17627-22642-26525 (random unique id)
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
    const storePath = path.join(storesDirectory, crypto.randomUUID())
    const storeDataPath = path.join(storePath, "data")
    const storeConfigPath = path.join(storePath, configFileName)
    await fs.ensureDir(storeDataPath)
    await fs.writeJson(storeConfigPath, store)

    //* Download the store (from npmjs)
    // npm view
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
}
