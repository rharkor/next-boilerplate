import { Command, Option } from "commander"

import { logger } from "@rharkor/logger"

export const registerVersion = (program: Command) => {
  const printVersion = async () => {
    await logger.init()
    const pJson = await import("../../../package.json")
    logger._log(pJson.version)
  }

  const versionCommand = new Command("version").description("Show the version")
  versionCommand.action(printVersion)

  program.addCommand(versionCommand)

  program.addOption(new Option("-v, --version", "output the version number")).action((options) => {
    if (options.version) {
      printVersion()
    }
  })
}
