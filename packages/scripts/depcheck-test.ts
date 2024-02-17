import chalk from "chalk"
import depcheck from "depcheck"
import * as fs from "fs"
import * as path from "path"
import * as url from "url"

import { logger } from "@lib/logger"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

const packages = fs.readdirSync(path.join(rootPath))
const packagesPath = packages.map((pkg) => path.join(rootPath, pkg))

const options: { skipMissing: boolean; ignoreMatches: string[] } = {
  skipMissing: false,
  ignoreMatches: [],
}

const main = async () => {
  let message = ""
  let hasError = false
  for (const pkg of packagesPath) {
    logger.log(chalk.blue(`Checking ${pkg}...`))
    if (pkg === path.join(rootPath, "docs")) {
      options.ignoreMatches.push("@docusaurus/preset-classic", "@mdx-js/react", "clsx", "prism-react-renderer")
    } else if (pkg === path.join(rootPath, "app")) {
      options.ignoreMatches.push(
        "@semantic-release/*",
        "env.mjs",
        "i18n-config",
        "sharp",
        "@nextui-org/*",
        "@react-aria/ssr",
        "@react-aria/visually-hidden",
        "cron",
        "autoprefixer",
        "@lib/logger"
      )
    } else if (pkg === path.join(rootPath, "landing")) {
      options.ignoreMatches.push("@types/react-dom", "@lib/logger")
    } else if (pkg === path.join(rootPath, "scripts")) {
      options.ignoreMatches.push("env-setup", "packages-selection", "replace-tokens", "runtime", "@lib/logger")
    } else if (pkg === path.join(rootPath, "cron")) {
      options.ignoreMatches.push("chalk", "@types/node")
    } else if (pkg === path.join(rootPath, "lib")) {
      continue
    }
    await depcheck(pkg, options).then(async (unused) => {
      const beautify = (arr: string[]) => {
        return arr
          .map((item) => {
            return `  - ${item}`
          })
          .join("\n")
      }
      const hasUnused = unused.dependencies.length > 0
      const hasMissing = Object.keys(unused.missing).length > 0
      message += `${
        hasUnused
          ? `${chalk.red(pkg + " Unused dependencies:")}
  ${beautify(unused.dependencies)}`
          : ""
      }
  ${
    hasMissing
      ? `${chalk.yellow(pkg + " Missing dependencies:")}
  ${beautify(Object.keys(unused.missing))}`
      : ""
  }`
      if (unused.dependencies.length > 0 || Object.keys(unused.missing).length > 0) {
        hasError = true
      }
    })
    logger.log(chalk.gray(`Done ${pkg}`))
  }
  if (hasError) {
    logger.log(message)
    process.exit(1)
  }

  process.exit(0)
}

main()

process.on("SIGINT", function () {
  logger.log("\n")
  logger.log("Bye!")
  process.exit()
})
