import { Command } from "commander"

import { applyConfig } from "../../../src/functions/apply-config"

export const registerApplyConfig = (program: Command) => {
  //* Apply config command
  const applyConfigCommand = new Command("apply-config").description("Apply the config file")
  applyConfigCommand.action(() => {
    applyConfig()
  })

  program.addCommand(applyConfigCommand)
}
