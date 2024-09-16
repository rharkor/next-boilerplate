import fs from "fs-extra"
import { globby } from "globby"
import path from "path"

import { templateSchema } from "@next-boilerplate/scripts/utils/template-config/index.js"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import { getPlugins } from "../plugins"

type TConfig = z.infer<typeof templateSchema>

import { z } from "zod"

import { getStores } from "../stores"

import { TTemplateStore } from "./types"

const configFileName = "config.json"

const loadTemplates = async () => {
  //* Get all the templates
  const templatesFilled: TTemplateStore[] = []
  const stores = await getStores()
  for (const store of stores) {
    const templatesDirectory = path.join(store.fullPath, "data", "templates")
    logger.debug(`Loading templates (${templatesDirectory})`)
    if (!(await fs.exists(templatesDirectory))) {
      throw new TRPCError({
        message: `The templates directory doesn't exist at ${templatesDirectory}`,
        code: "INTERNAL_SERVER_ERROR",
      })
    }

    const formattedTemplatesDirectory = path.join(templatesDirectory).replace(/\\/g, "/")
    const globbyPath = path.join(formattedTemplatesDirectory, "**", configFileName).replace(/\\/g, "/")
    const templates = await globby(globbyPath)
    logger.debug(`Found ${templates.length} templates in ${globbyPath}`)

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
  }

  templatesFilled.sort((a, b) => a.name.localeCompare(b.name))

  return templatesFilled
}

export const getTemplates = async (opts?: { search?: string }) => {
  const templates = await new Promise<TTemplateStore[]>(async (resolve) => {
    const templates = await loadTemplates()
    resolve(templates)
    return
  })
  return templates.filter((template) => {
    if (!opts?.search) return true
    return template.name.toLowerCase().includes(opts.search.toLowerCase())
  })
}

export const getTemplate = async (id: string) => {
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

  return filledTemplate
}
