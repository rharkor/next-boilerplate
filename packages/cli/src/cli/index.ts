import { Command } from "commander"

import { logger } from "@rharkor/logger"

import { registerApplyConfig } from "./apply-config"

export const registerCli = async (program: Command) => {
  await logger.init()

  registerApplyConfig(program)
}
