import chalk from "chalk"
import depcheck from "depcheck"
import * as path from "path"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")

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
  ],
}

depcheck(rootPath, options).then(async (unused) => {
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

process.on("SIGINT", function () {
  console.log("\n")
  console.log("Bye!")
  process.exit()
})
