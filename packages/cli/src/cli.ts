import { program } from "commander"

import { logger } from "@rharkor/logger"

import { registerCli } from "./cli/index"

const register = async () => {
  program
    .command("version")
    .description("Show the version")
    .action(async () => {
      await logger.init()
      const pJson = await import("../package.json")
      logger._log(pJson.version)
    })

  await registerCli(program)

  program.parse()
}

register()
