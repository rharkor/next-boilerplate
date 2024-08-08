import fs from "fs-extra"
import path from "path"
import { fileURLToPath } from "url"

import { logger } from "@rharkor/logger"

// Get the current package directory
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory
const root = path.resolve(__dirname, "../../../../../../..")

const templatesDirectory = path.join(root, "packages", "templates")

export const getTemplates = async () => {
  if (!(await fs.exists(templatesDirectory))) {
    const errMsg = `The templates directory doesn't exist at ${templatesDirectory}`
    logger.error(errMsg)
    throw new Error(errMsg)
  }

  const templates = await fs.readdir(templatesDirectory)
  return templates
}
