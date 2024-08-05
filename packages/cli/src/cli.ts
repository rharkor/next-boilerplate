import { program } from "commander"

import { logger } from "@rharkor/logger"

import pJson from "../package.json"

import { registerCli } from "./cli/index"

const register = async () => {
  program
    .command("version")
    .description("Show the version")
    .action(async () => {
      await logger.init()
      logger._log(pJson.version)
    })

  await registerCli(program)

  program.parse()
}

register()
