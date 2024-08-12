import { Command, Option } from "commander"

import { logger } from "@rharkor/logger"

import { registerApplyConfig } from "./apply-config"
import { printVersion, registerVersion } from "./version"
import { openWeb } from "./web"

export const registerCli = async (program: Command) => {
  await logger.init()

  registerApplyConfig(program)
  registerVersion(program)

  program
    .description("Start/Open the web interface")
    .addOption(new Option("-v, --version", "output the version number"))
    .action((options) => {
      if (options.version) {
        printVersion()
      } else {
        openWeb()
      }
    })
}
