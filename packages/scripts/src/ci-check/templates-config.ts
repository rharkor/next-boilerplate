#!/usr/bin/env zx

/**
 * Validate the config of each templates
 */

import { cdAtRoot, cwdAtRoot } from "@/utils"
import { componentConfigSchema, configSchema, TComponentConfig, TConfig } from "@/utils/template-config"
import { logger, task } from "@rharkor/logger"

import "zx/globals"

cwdAtRoot()
cdAtRoot()

const templatesDirectory = "packages/templates"
const componentsDirectory = "packages/cli/assets/components"
const configFileName = "config.json"

const validateTemplateTask = await task.startTask({
  name: "Validating templates config... 🧰",
})

//* Get all the templates
validateTemplateTask.print("Getting all the templates")
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
validateTemplateTask.print(`Found ${templates.length} templates`)

//* Validate the config
validateTemplateTask.print("Validating the config")
for (const template of templates) {
  try {
    configSchema.parse(template.config)
  } catch (error) {
    validateTemplateTask.error(`The template ${template.path} has an invalid config: ${error}`)
    validateTemplateTask.stop()
    process.exit(1)
  }
}

//* Validate the plugins
validateTemplateTask.print("Validating the plugins")
for (const template of templates) {
  for (const reference of template.config.plugins) {
    const componentName = typeof reference === "string" ? reference : reference.name
    const componentPath = path.join(componentsDirectory, componentName)
    if (!(await fs.exists(componentPath))) {
      validateTemplateTask.error(`The component ${componentName} referenced by the config doesn't exist`)
      validateTemplateTask.stop()
      process.exit(1)
    }
    const componentConfigPath = path.join(componentPath, configFileName)
    const componentContentName = (await fs.readdir(componentPath)).find((file) => file.startsWith("index"))
    if (!componentContentName) {
      validateTemplateTask.error(`The component ${componentName} referenced by the config doesn't exist`)
      validateTemplateTask.stop()
      process.exit(1)
    }
    const componentContentPath = path.join(componentPath, componentContentName)
    const componentConfig = (await fs.readJson(componentConfigPath)) as TComponentConfig
    try {
      componentConfigSchema.parse(componentConfig)
    } catch (error) {
      validateTemplateTask.error(`The component config file ${componentConfigPath} is not valid`)
      validateTemplateTask.stop()
      logger.error(error)
      process.exit(1)
    }

    //? Check if the component exists
    if (!componentContentPath || !(await fs.exists(componentContentPath))) {
      validateTemplateTask.error(`The component ${componentName} referenced by the config doesn't exist`)
      validateTemplateTask.stop()
      process.exit(1)
    }
  }
}

validateTemplateTask.stop("Templates config validated! 🎉")
