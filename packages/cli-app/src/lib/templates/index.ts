import fs from "fs-extra"
import { globby } from "globby"
import path from "path"

import { templateSchema } from "@next-boilerplate/scripts/utils/template-config/index.js"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import { getPlugins } from "../plugins"

type TConfig = z.infer<typeof templateSchema>

import { z } from "zod"

import { env } from "../env"

import {
  getSingleTemplateFromStore,
  getTemplatesFromStore,
  setSingleTemplateToStore,
  setTemplatesToStore,
  TTemplateStore,
} from "./store"

// Get the current package directory
const cwd = process.cwd()
// eslint-disable-next-line no-process-env
const dir = path.resolve(cwd, env.CLI_REL_PATH ?? "../..")

const configFileName = "config.json"
const templatesDirectory = path.join(dir, "assets", "templates")

export const getTemplates = async () => {
  const templatesFromStore = await getTemplatesFromStore()
  if (templatesFromStore) return templatesFromStore

  logger.debug(`Loading templates (${templatesDirectory})`)
  if (!(await fs.exists(templatesDirectory))) {
    throw new TRPCError({
      message: `The templates directory doesn't exist at ${templatesDirectory}`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  //* Get all the templates
  const formattedTemplatesDirectory = templatesDirectory.replace(/\\/g, "/")
  const templates = await globby(path.join(formattedTemplatesDirectory, "**", configFileName).replace(/\\/g, "/"))
  logger.debug(
    `Found ${templates.length} templates in ${path.join(formattedTemplatesDirectory, "**", configFileName).replace(/\\/g, "/")}`
  )
  const templatesFilled: TTemplateStore[] = []

  //* Validate their config
  for (const template of templates) {
    const templateConfig = (await fs.readJson(template)) as TConfig

    try {
      templateSchema.parse(templateConfig)
    } catch (error) {
      logger.error(error)
      throw new TRPCError({
        message: `The config of the template ${template} is invalid`,
        code: "INTERNAL_SERVER_ERROR",
      })
    }

    const sourcePath = path.dirname(template).replace(formattedTemplatesDirectory, "").replace(/^\//, "")
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
        logger.error(`Current loaded plugins: ${plugins.map((p) => p.id).join(", ")}`)
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
