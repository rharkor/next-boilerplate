import { exec } from "child_process"
import open from "open"
import path from "path"
import { fileURLToPath } from "url"
import waitPort from "wait-port"

import { logger } from "@rharkor/logger"

// Get the current package directory
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory
// const dir = path.resolve(__dirname, "../../..")
//? Do not use ../../.. because this file will be compiled and put in dist/index.js so the path will be wrong
const dir = __dirname
//? Change cwd because the assets are not in the same folder
const cwd = process.cwd()

const defaultPort = 3000
// eslint-disable-next-line no-process-env
const resolvedPort = process.env.PORT || defaultPort.toString()
export const openWeb = async () => {
  await logger.init()
  logger._log("Starting web interface")
  const cp = exec("node server.js", {
    cwd: path.join(dir, "app"),
    env: {
      NODE_ENV: "production",
      HOSTNAME: "0.0.0.0",
      ROOT_PATH: cwd,
      PORT: resolvedPort,
      // CLI_REL_PATH: "../../../..",
    },
  })
  cp.stdout?.pipe(process.stdout)
  cp.stderr?.pipe(process.stderr)
  cp.on("close", (code) => {
    logger._log(`Web interface exited with code ${code}`)
  })
  await waitPort({ host: "localhost", port: parseInt(resolvedPort), timeout: 10000, interval: 500, output: "silent" })
  await open(`http://localhost:${resolvedPort}`)
}
