import fs from "fs-extra"
import { globby } from "globby"
import path from "path"
import { z } from "zod"

import { storeConfigSchema, templateSchema } from "@next-boilerplate/scripts/utils/template-config/index.js"
import { getStores } from "@next-boilerplate/scripts/utils/template-config/stores.js"
import { logger } from "@rharkor/logger"
import { TRPCError } from "@trpc/server"

import { env } from "../env"
import { getPlugins } from "../plugins"

import { TTemplateStore } from "./types"

type TConfig = z.infer<typeof templateSchema>

// Get the current package directory
const cwd = process.cwd()
// eslint-disable-next-line no-process-env
const dir = path.resolve(cwd, env.CLI_REL_PATH ?? "../..")

const configFileName = "config.json"
export const assetsDirectory = path.join(dir, "assets")

const loadTemplates = async () => {
  //* Get all the templates
  const templatesFilled: TTemplateStore[] = []
  const stores = await getStores({ assetsDirectory })
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
      templatesFilled.push({ ...templateConfig, sourcePath, store })
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

export const getTemplate = async (name: string, store: z.infer<typeof storeConfigSchema>) => {
  const templates = await getTemplates()
  const template = templates.find(
    (p) => p.name === name && p.store.name === store.name && p.store.version === store.version
  )
  if (!template) {
    throw new TRPCError({
      message: `Template ${name} not found (store: ${store.name}@${store.version})`,
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  //? Fill the template with the plugins
  const plugins = await getPlugins()
  const foundPlugins = template.plugins
    .map((_pluginInTemplate) => {
      const pluginInTemplate =
        typeof _pluginInTemplate === "string" ? { name: _pluginInTemplate, store } : _pluginInTemplate
      const plugin = plugins.find(
        (p) =>
          p.sourcePath === pluginInTemplate.name &&
          p.store.name === pluginInTemplate.store.name &&
          p.store.version === pluginInTemplate.store.version
      )
      if (!plugin) {
        logger.error(
          `Plugin ${pluginInTemplate.name} (store: ${pluginInTemplate.store.name}@${pluginInTemplate.store.version}) in template ${name} not found`
        )
        logger.error(`Current loaded plugins: ${plugins.map((p) => p.sourcePath).join(", ")}`)
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
