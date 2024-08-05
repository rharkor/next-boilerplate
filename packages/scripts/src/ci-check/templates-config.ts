#!/usr/bin/env zx

/**
 * Validate the config of each templates
 */

import { z } from "zod"

import { cdAtRoot, cwdAtRoot } from "@/utils"
import { task } from "@rharkor/logger"

import "zx/globals"

cwdAtRoot()
cdAtRoot()

const templatesDirectory = "packages/templates"
const componentsDirectory = "packages/components"
const configFileName = "config.json"

const configSchema = z.object({
  name: z.string(),
  references: z.record(z.string(), z.string()),
})
type TConfig = z.infer<typeof configSchema>

const validateTemplateTask = await task.startTask({
  name: "Validating templates config... 🧰",
})

//* Get all the templates
validateTemplateTask.print("Getting all the templates")
const templatesPath = await fs.readdir(templatesDirectory)

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

//* Validate the references
validateTemplateTask.print("Validating the references")
for (const template of templates) {
  for (const to of Object.values(template.config.references)) {
    //? Check if the component exists
    const toDirPath = path.join(componentsDirectory, to)
    // Find the file that start with "index"
    const toPathFile = (await fs.readdir(toDirPath)).find((file) => file.startsWith("index"))
    const toPath = toPathFile ? path.join(toDirPath, toPathFile) : undefined
    if (!toPath || !(await fs.exists(toPath))) {
      validateTemplateTask.error(`The component ${to} referenced by the template ${template.path} doesn't exist`)
      validateTemplateTask.stop()
      process.exit(1)
    }
  }
}

validateTemplateTask.stop("Templates config validated! 🎉")
