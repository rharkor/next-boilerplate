import * as path from "path"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootDir = path.join(__dirname, "..", "..", "..", "..")

/**
 * Get the path from root directory
 * @param _path
 * @returns
 */
export const getPath = (...opts: string[]) => {
  if (!opts) return rootDir
  return path.join(rootDir, ...opts)
}
