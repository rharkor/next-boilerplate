import * as fs from "fs/promises"
import * as path from "path"

import { exec } from "./utils/cmd"
import { getPath } from "./utils/path"

const rootPath = getPath()

export const completeInitialisation = async () => {
  // Linting and formatting
  await exec("npm run lint:fix", {
    cwd: rootPath,
    name: "Linting",
    successMessage: "Linted",
  })
  await exec("npm run prettier:fix", {
    cwd: rootPath,
    name: "Formatting",
    successMessage: "Formatted",
  })

  // eslint-disable-next-line no-process-env
  if (process.env.SKIP_INIT_CHECK !== "true") {
    await fs.unlink(path.join(rootPath, "scripts", ".init-todo")).catch(() => {})
  }
}
