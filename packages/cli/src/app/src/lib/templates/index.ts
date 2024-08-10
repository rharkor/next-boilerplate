import fs from "fs-extra"
import { globby } from "globby"
import path from "path"
import { fileURLToPath } from "url"

import { configSchema, TConfig } from "@next-boilerplate/scripts/utils/template-config/index.js"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import { getPlugins } from "../plugins"

import {
  getSingleTemplateFromStore,
  getTemplatesFromStore,
  setSingleTemplateToStore,
  setTemplatesToStore,
  TTemplateStore,
} from "./store"

// Get the current package directory
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory
const dir = path.resolve(__dirname, "../../../../..")

const configFileName = "config.json"
const templatesDirectory = path.join(dir, "assets", "templates")

export const getTemplates = async () => {
  const templatesFromStore = await getTemplatesFromStore()
  if (templatesFromStore) return templatesFromStore

  logger.info("Loading templates")
  if (!(await fs.exists(templatesDirectory))) {
    throw new TRPCError({
      message: `The templates directory doesn't exist at ${templatesDirectory}`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  //* Get all the templates
  const templates = await globby(path.join(templatesDirectory, "**", configFileName))
  const templatesFilled: TTemplateStore[] = []

  //* Validate their config
  for (const template of templates) {
    const templateConfig = (await fs.readJson(template)) as TConfig

    try {
      configSchema.parse(templateConfig)
    } catch (error) {
      logger.error(error)
      throw new TRPCError({
        message: `The config of the template ${template} is invalid`,
        code: "INTERNAL_SERVER_ERROR",
      })
    }

    const sourcePath = path.dirname(template).replace(templatesDirectory, "").replace(/^\//, "")
    templatesFilled.push({ ...templateConfig, sourcePath, id: sourcePath })
  }

  templatesFilled.sort((a, b) => a.name.localeCompare(b.name))

  setTemplatesToStore(templatesFilled)
  return templatesFilled
}

export const getTemplate = async (id: string) => {
  const templateFromStore = await getSingleTemplateFromStore(id)
  if (templateFromStore) return templateFromStore

  const templates = await getTemplates()
  const template = templates.find((p) => p.id === id)
  if (!template) {
    throw new TRPCError({
      message: `Template ${id} not found`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  //? Fill the template with the plugins
  const plugins = await getPlugins()
  const foundPlugins = template.plugins
    .map((pluginId) => {
      const plugin = plugins.find((p) => p.id === pluginId)
      if (!plugin) {
        logger.error(`Plugin ${pluginId} in template ${id} not found`)
      }
      return plugin
    })
    .filter(Boolean)
  const filledTemplate = {
    ...template,
    plugins: foundPlugins,
  }

  setSingleTemplateToStore(id, filledTemplate)
  return filledTemplate
}
