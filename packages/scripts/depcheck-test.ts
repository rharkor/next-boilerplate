import chalk from "chalk"
import depcheck from "depcheck"
import * as fs from "fs"
import * as path from "path"
import * as url from "url"

import { logger } from "@next-boilerplate/lib"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootPath = path.join(__dirname, "..")
const appsRootPath = path.join(rootPath, "..", "apps")

const packages = fs.readdirSync(rootPath)
const apps = fs.readdirSync(appsRootPath)
const packagesPath = packages
  .map((pkg) => path.join(rootPath, pkg))
  .flatMap((pkg) => {
    if (pkg.includes("packages/configs")) {
      const subPackages = fs.readdirSync(pkg)
      return subPackages.map((subPkg) => path.join(pkg, subPkg))
    } else return pkg
  })
  .concat(apps.map((app) => path.join(appsRootPath, app)))

const options: { skipMissing: boolean; ignoreMatches: string[] } = {
  skipMissing: false,
  ignoreMatches: ["@next-boilerplate/scripts"],
}

const main = async () => {
  let message = ""
  let hasError = false
  for (const pkg of packagesPath) {
    logger.log(chalk.blue(`Checking ${pkg}...`))
    if (pkg === path.join(appsRootPath, "docs")) {
      options.ignoreMatches.push("@docusaurus/preset-classic", "@mdx-js/react", "clsx", "prism-react-renderer")
    } else if (pkg === path.join(appsRootPath, "app")) {
      options.ignoreMatches.push(
        "@semantic-release/*",
        "env.mjs",
        "i18n-config",
        "sharp",
        "@nextui-org/*",
        "@react-aria/ssr",
        "@react-aria/visually-hidden",
        "cron",
        "autoprefixer"
      )
    } else if (pkg === path.join(appsRootPath, "landing")) {
      options.ignoreMatches.push("@types/react-dom")
    } else if (pkg === path.join(rootPath, "scripts")) {
      options.ignoreMatches.push(
        "env-setup",
        "packages-selection",
        "replace-tokens",
        "runtime",
        "complete-initialisation",
        "modules-selection"
      )
    } else if (pkg === path.join(appsRootPath, "cron")) {
      options.ignoreMatches.push("chalk", "@types/node")
    } else if (pkg === path.join(rootPath, "lib")) {
      continue
    } else if (pkg === path.join(rootPath, "configs", "eslint")) {
      options.ignoreMatches.push(
        "next",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
        "eslint",
        "eslint-config-next",
        "eslint-config-prettier",
        "eslint-config-react-app",
        "eslint-plugin-simple-import-sort",
        "eslint-plugin-tailwindcss",
        "eslint-plugin-unused-imports",
        "eslint-plugin-custom-rule"
      )
    } else if (pkg === path.join(rootPath, "configs", "eslint-plugin-custom-rule")) {
      options.ignoreMatches.push("eslint-config-custom")
    } else if (pkg == path.join(rootPath, "configs", "prettier")) {
      options.ignoreMatches.push("prettier", "prettier-plugin-tailwindcss")
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
  }\n`
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
