#!/usr/bin/env zx

/**
 * Validate the config of each templates
 */

import { z } from "zod"

import { cdAtRoot, cwdAtRoot } from "@/utils"
import { componentConfigSchema } from "@/utils/template-config"
import { logger, task } from "@rharkor/logger"

import "zx/globals"

cwdAtRoot()
cdAtRoot()

type TComponentConfig = z.infer<typeof componentConfigSchema>

const componentsDirectory = "packages/cli/assets/components"
const configFileName = "config.json"

const validateComponentTask = await task.startTask({
  name: "Validating components config... 🧰",
})

//* Get all the components
const components = await globby(path.join(componentsDirectory, "**", configFileName))

for (const component of components) {
  const componentConfig = (await fs.readJson(component)) as TComponentConfig

  try {
    componentConfigSchema.parse(componentConfig)
  } catch (error) {
    validateComponentTask.error(`The config of the component ${component} is invalid!`)
    validateComponentTask.stop()
    logger.error(error)
    process.exit(1)
  }
}

validateComponentTask.stop("Components config validated! 🎉")
