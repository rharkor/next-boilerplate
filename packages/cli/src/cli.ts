import { program } from "commander"

import { registerCli } from "./cli/index"

const register = async () => {
  await registerCli(program)

  program.parse()
}

register()
