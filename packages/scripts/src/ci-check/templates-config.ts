#!/usr/bin/env zx

/**
 * Validate the config of each templates
 */

import { z } from "zod"
import { $ } from "zx"

import { cdAtRoot, cwdAtRoot } from "@/utils"
import { task } from "@rharkor/logger"

import "zx/globals"

cwdAtRoot()
cdAtRoot()

const templatesDirectory = "packages/templates"
const componentsDirectory = "packages/components"
const configFileName = "config.json"

const onlyCheck = argv.check === "true"

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
    if (onlyCheck) {
      validateTemplateTask.stop()
      process.exit(1)
    }
    continue
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
    if (onlyCheck) {
      validateTemplateTask.stop()
      process.exit(1)
    }
  }
}

//* Apply references
validateTemplateTask.print("Applying references")

// Diff the checksum of the directories/files and apply the changes
const applyCompareChecksum = async (fromPath: string, toPath: string) => {
  const isDirectory = await fs.stat(fromPath).then((stat) => stat.isDirectory())

  if (isDirectory) {
    const fromChecksum = await $`find ${fromPath} -type f -exec md5sum {} \\;`.text()
    const toChecksum = await $`find ${toPath} -type f -exec md5sum {} \\;`.text()

    if (fromChecksum !== toChecksum) {
      if (onlyCheck) {
        validateTemplateTask.error(`The directory ${fromPath} is different from the component ${toPath}`)
        validateTemplateTask.stop()
        process.exit(1)
      }
      validateTemplateTask.print(`Copying the directory ${fromPath} to the component ${toPath}`)
      await fs.copy(fromPath, toPath, { overwrite: true })
    }
  } else {
    const fromChecksum = await $`md5sum ${fromPath}`.text()
    const toChecksum = await $`md5sum ${toPath}`.text()

    if (fromChecksum !== toChecksum) {
      if (onlyCheck) {
        validateTemplateTask.error(`The file ${fromPath} is different from the component ${toPath}`)
        validateTemplateTask.stop()
        process.exit(1)
      }
      validateTemplateTask.print(`Copying the file ${fromPath} to the component ${toPath}`)
      await fs.copy(fromPath, toPath)
    }
  }
}

for (const template of templates) {
  for (const [from, to] of Object.entries(template.config.references)) {
    //? Check if the component exists
    const toDirPath = path.join(componentsDirectory, to)
    // Find the file that start with "index"
    const toPathFile = (await fs.readdir(toDirPath)).find((file) => file.startsWith("index"))
    const toPath = toPathFile ? path.join(toDirPath, toPathFile) : undefined
    if (!toPath || !(await fs.exists(toPath))) {
      validateTemplateTask.error(`The component ${to} referenced by the template ${template.path} doesn't exist`)
      if (onlyCheck) {
        validateTemplateTask.stop()
        process.exit(1)
      }
      continue
    }

    // Verify if the template from is up to date
    const fromPath = path.join(template.path, from)
    if (!(await fs.exists(fromPath))) {
      if (onlyCheck) {
        validateTemplateTask.error(
          `The file/directory ${from} referenced by the template ${template.path} doesn't exist`
        )
        validateTemplateTask.stop()
        process.exit(1)
      }
      validateTemplateTask.print(`Copying the component ${to} to the template ${template.path}`)
      await fs.copy(toPath, fromPath)
    } else {
      // Compare the checksum
      await applyCompareChecksum(toPath, fromPath)
    }
  }
}

validateTemplateTask.stop("Templates config validated! 🎉")
