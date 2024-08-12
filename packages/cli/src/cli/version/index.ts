import { Command } from "commander"

import { logger } from "@rharkor/logger"

export const printVersion = async () => {
  await logger.init()
  const pJson = await import("../../../package.json")
  logger._log(pJson.version)
}

export const registerVersion = (program: Command) => {
  const versionCommand = new Command("version").description("Show the version")
  versionCommand.action(printVersion)

  program.addCommand(versionCommand)
}
