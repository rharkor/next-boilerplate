import chalk from "chalk"
import depcheck from "depcheck"
import * as path from "path"
import * as url from "url"
import * as fs from "fs"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

const packages = fs.readdirSync(path.join(rootPath))
const packagesPath = packages.map((pkg) => path.join(rootPath, pkg))

const options = {
  skipMissing: false,
  ignoreMatches: [
    "@semantic-release/*",
    "env.mjs",
    "i18n-config",
    "sharp",
    "@nextui-org/*",
    "@react-aria/ssr",
    "@react-aria/visually-hidden",
    "cron",
    "autoprefixer",
  ],
}

packagesPath.forEach((pkg) => {
  console.log(chalk.blue(`Checking ${pkg}...`))
  depcheck(pkg, options).then(async (unused) => {
    const beautify = (arr: string[]) => {
      return arr
        .map((item) => {
          return `  - ${item}`
        })
        .join("\n")
    }
    const hasUnused = unused.dependencies.length > 0
    const hasMissing = Object.keys(unused.missing).length > 0
    const message = `${
      hasUnused
        ? `${chalk.red("Unused dependencies:")}
  ${beautify(unused.dependencies)}`
        : ""
    }
  ${
    hasMissing
      ? `${chalk.yellow("Missing dependencies:")}
  ${beautify(Object.keys(unused.missing))}`
      : ""
  }`

    if (unused.dependencies.length > 0 || Object.keys(unused.missing).length > 0) {
      console.log(message)
      process.exit(1)
    }

    process.exit(0)
  })
  console.log(chalk.green(`Done ${pkg}`))
})

process.on("SIGINT", function () {
  console.log("\n")
  console.log("Bye!")
  process.exit()
})
