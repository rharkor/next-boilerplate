/**
 * This script will coding environment
 */

import { exec } from "./utils/cmd"
import { getPath } from "./utils/path"

export const codingEnv = async () => {
  await exec("bash ./packages/scripts/install/install.sh", {
    cwd: getPath(),
    name: "Setting up coding environment",
    successMessage: "Coding environment setup",
  })
}
