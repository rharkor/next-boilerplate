import fs from "fs-extra"
import { globby } from "globby"
import path from "path"

import { storeConfigSchema } from "@next-boilerplate/scripts/utils/template-config"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

type TConfig = z.infer<typeof storeConfigSchema>

import { z } from "zod"

import { env } from "../env"

import { getStoresFromStore, setStoresToStore, TStoreStore } from "./store"

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

  storesFilled.sort((a, b) => a.remote.localeCompare(b.remote))

  setStoresToStore(storesFilled)
  return storesFilled
}

export const getStores = async (opts?: { search?: string }) => {
  const stores = await new Promise<TStoreStore[]>(async (resolve) => {
    const storesFromStore = await getStoresFromStore()
    if (storesFromStore) {
      resolve(storesFromStore)
      return
    }

    const stores = await loadStores()
    resolve(stores)
    return
  })
  return stores.filter((store) => {
    if (!opts?.search) return true
    return store.remote.toLowerCase().includes(opts.search.toLowerCase())
  })
}
