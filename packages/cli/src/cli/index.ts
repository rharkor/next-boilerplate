import { Command } from "commander"

import { logger } from "@rharkor/logger"

import { registerApplyConfig } from "./apply-config"
import { registerVersion } from "./version"

export const registerCli = async (program: Command) => {
  await logger.init()

  registerApplyConfig(program)
  registerVersion(program)
}
