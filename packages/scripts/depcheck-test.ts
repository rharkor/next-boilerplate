import chalk from "chalk"
import depcheck from "depcheck"
import * as fs from "fs"
import * as path from "path"
import * as url from "url"

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

const main = async () => {
  let message = ""
  let hasError = false
  for (const pkg of packagesPath) {
    console.log(chalk.blue(`Checking ${pkg}...`))
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
    console.log(chalk.green(`Done ${pkg}`))
  }
  if (hasError) {
    console.log(message)
    process.exit(1)
  }

  process.exit(0)
}

main()

process.on("SIGINT", function () {
  console.log("\n")
  console.log("Bye!")
  process.exit()
})
