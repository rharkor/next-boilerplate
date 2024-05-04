/**
 * Build the required packages for the startup process
 */

import { exec } from "./utils/cmd"
import { getPath } from "./utils/path"

export const startupRequirements = async () => {
  const command = "turbo run build --filter='@next-boilerplate/*'^..."
  await exec(command, {
    successMessage: "Startup requirements built",
    name: "Build startup requirements",
    cwd: getPath(),
  })
}
