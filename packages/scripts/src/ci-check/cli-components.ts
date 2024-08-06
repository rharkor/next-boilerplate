#!/usr/bin/env zx

/**
 * Validate the config of each templates
 */

import { z } from "zod"

import { cdAtRoot, cwdAtRoot } from "@/utils"
import { pluginConfigSchema } from "@/utils/template-config"
import { logger } from "@rharkor/logger"
import { task } from "@rharkor/task"

import "zx/globals"

cwdAtRoot()
cdAtRoot()

type TpluginConfig = z.infer<typeof pluginConfigSchema>

const pluginsDirectory = "packages/cli/assets/plugins"
const configFileName = "config.json"

const validatepluginTask = await task.startTask({
  name: "Validating plugins config... 🧰",
})

//* Get all the plugins
const plugins = await globby(path.join(pluginsDirectory, "**", configFileName))

for (const plugin of plugins) {
  const pluginConfig = (await fs.readJson(plugin)) as TpluginConfig

  try {
    pluginConfigSchema.parse(pluginConfig)
  } catch (error) {
    validatepluginTask.error(`The config of the plugin ${plugin} is invalid!`)
    validatepluginTask.stop()
    logger.error(error)
    process.exit(1)
  }
}

validatepluginTask.stop("plugins config validated! 🎉")
