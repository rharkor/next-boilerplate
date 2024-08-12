#!/usr/bin/env zx

/**
 * Validate the config of each templates
 */

import { z } from "zod"

import { cdAtRoot, cwdAtRoot } from "@/utils"
import { pluginConfigSchema, templateSchema, TPluginConfig } from "@/utils/template-config"
import { logger } from "@rharkor/logger"
import { task } from "@rharkor/task"

type TConfig = z.infer<typeof templateSchema>

import "zx/globals"

cwdAtRoot()
cdAtRoot()

const templatesDirectory = "packages/cli/assets/templates"
const pluginsDirectory = "packages/cli/assets/plugins"
const configFileName = "config.json"

const validateTemplateTask = await task.startTask({
  name: "Validating templates config... 🧰",
})

//* Get all the templates
validateTemplateTask.log("Getting all the templates")
const templatesPath = (await fs.readdir(templatesDirectory, { withFileTypes: true }))
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)

const templates: { config: TConfig; path: string }[] = []
for (const templatePath of templatesPath) {
  const configPath = path.join(templatesDirectory, templatePath, configFileName)
  if (!(await fs.exists(configPath))) {
    validateTemplateTask.error(`The template ${templatePath} doesn't have a config file`)
    validateTemplateTask.stop()
    process.exit(1)
  }
  const config = await fs.readJSON(configPath)
  templates.push({ config, path: path.join(templatesDirectory, templatePath) })
}
validateTemplateTask.log(`Found ${templates.length} templates`)

//* Validate the config
validateTemplateTask.log("Validating the config")
for (const template of templates) {
  try {
    templateSchema.parse(template.config)
  } catch (error) {
    validateTemplateTask.error(`The template ${template.path} has an invalid config: ${error}`)
    validateTemplateTask.stop()
    process.exit(1)
  }
}

//* Validate the plugins
validateTemplateTask.log("Validating the plugins")
for (const template of templates) {
  for (const reference of template.config.plugins) {
    const pluginName = typeof reference === "string" ? reference : reference.name
    const pluginPath = path.join(pluginsDirectory, pluginName)
    if (!(await fs.exists(pluginPath))) {
      validateTemplateTask.error(`The plugin ${pluginName} referenced by the config doesn't exist`)
      validateTemplateTask.stop()
      process.exit(1)
    }
    const pluginConfigPath = path.join(pluginPath, configFileName)
    const pluginContentName = (await fs.readdir(pluginPath)).find((file) => file.startsWith("index"))
    if (!pluginContentName) {
      validateTemplateTask.error(`The plugin ${pluginName} referenced by the config doesn't exist`)
      validateTemplateTask.stop()
      process.exit(1)
    }
    const pluginContentPath = path.join(pluginPath, pluginContentName)
    const pluginConfig = (await fs.readJson(pluginConfigPath)) as TPluginConfig
    try {
      pluginConfigSchema.parse(pluginConfig)
    } catch (error) {
      validateTemplateTask.error(`The plugin config file ${pluginConfigPath} is not valid`)
      validateTemplateTask.stop()
      logger.error(error)
      process.exit(1)
    }

    //? Check if the plugin exists
    if (!pluginContentPath || !(await fs.exists(pluginContentPath))) {
      validateTemplateTask.error(`The plugin ${pluginName} referenced by the config doesn't exist`)
      validateTemplateTask.stop()
      process.exit(1)
    }
  }
}

validateTemplateTask.stop("Templates config validated! 🎉")
