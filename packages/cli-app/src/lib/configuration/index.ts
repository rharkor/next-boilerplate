import fs from "fs-extra"
import path from "path"
import { z } from "zod"

import { configurationSchema as webConfigurationSchema, TConfiguration } from "@/api/configuration/schemas"
import { configSchema } from "@next-boilerplate/cli-helpers/config"
import { getStoreUID } from "@next-boilerplate/cli-helpers/stores"
import { handleDownloadStores } from "@next-boilerplate/cli-helpers/stores-helpers"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import { env } from "../env"
import { getPlugins } from "../plugins"

const configurationName = "config.json"
// Get the current package directory
const cwd = process.cwd()
// eslint-disable-next-line no-process-env
const dir = path.resolve(cwd, env.CLI_REL_PATH ?? "../..")

export const assetsDirectory = path.join(dir, "assets")

export const optionalConfigSchema = configSchema.partial()

const webConfigToApiConfig = (webConfig: TConfiguration): z.infer<typeof optionalConfigSchema> => {
  try {
    webConfigurationSchema().parse(webConfig)
  } catch (error) {
    logger.error(error)
    throw new TRPCError({
      message: `The web configuration is invalid`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  try {
    const content = optionalConfigSchema.parse({
      name: webConfig.name,
      plugins: (webConfig.plugins ?? []).map((plugin) => {
        const fullP = {
          name: plugin.sourcePath,
          store: plugin.store,
          paths: plugin.paths,
        }
        return fullP
      }),
      stores: webConfig.stores ?? [
        {
          name: "@next-boilerplate/store",
          version: "latest",
        },
      ],
    })
    return content
  } catch (error) {
    logger.error("Failed to convert the web configuration", error)
    throw new TRPCError({
      message: `Failed to convert the web configuration`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }
}

const apiConfigToWebConfig = async (apiConfig: z.infer<typeof optionalConfigSchema>): Promise<TConfiguration> => {
  try {
    optionalConfigSchema.parse(apiConfig)
  } catch (error) {
    logger.error(error)
    throw new TRPCError({
      message: `The configuration file is invalid`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  const plugins = await getPlugins()

  try {
    const content: TConfiguration = {
      name: apiConfig.name,
      plugins: apiConfig.plugins?.map((plugin) => {
        const foundPlugin = plugins.find(
          (p) => p.sourcePath === plugin.name && getStoreUID(p.store) === getStoreUID(plugin.store)
        )
        if (!foundPlugin) {
          throw new TRPCError({
            message: `The plugin ${plugin.name} was not found (store: ${plugin.store.name}@${plugin.store.version}). Currently available plugins: ${plugins.map((p) => p.sourcePath).join(", ")}`,
            code: "INTERNAL_SERVER_ERROR",
          })
        }

        return {
          name: foundPlugin.name,
          store: foundPlugin.store,
          description: foundPlugin.description,
          sourcePath: foundPlugin.sourcePath,
          paths: foundPlugin.paths.map((path) => {
            const overridedTo =
              typeof plugin === "string" ? undefined : plugin.paths.find((p) => p.from === path.from)?.to
            return {
              from: path.from,
              to: path.to,
              overridedTo,
            }
          }),
        }
      }),
      stores: apiConfig.stores,
    }
    webConfigurationSchema().parse(content)
    return content
  } catch (error) {
    logger.error(error)
    throw new TRPCError({
      message: `Failed to convert the configuration file`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }
}

export const getConfiguration = async () => {
  const configurationPath = path.join(env.ROOT_PATH, configurationName)
  const configurationExists = await fs.pathExists(configurationPath)
  if (!configurationExists) {
    // Create the configuration file
    await fs.writeJson(configurationPath, {})
  }
  const content = await fs.readJson(configurationPath)
  await handleDownloadStores({ assetsDirectory, config: content })
  return apiConfigToWebConfig(content)
}

export const setConfiguration = async (newConfiguration: TConfiguration) => {
  const content = webConfigToApiConfig(newConfiguration)
  await handleDownloadStores({ assetsDirectory, config: content })
  const configurationPath = path.join(env.ROOT_PATH, configurationName)
  fs.writeJson(configurationPath, content, {
    spaces: 4,
  })
}
