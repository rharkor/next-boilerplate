/**
 * This script is intended to run only once at the beginning of the project
 * It will replace all tokens in the project with the user's input
 */

import chalk from "chalk"
import { execSync } from "child_process"
import * as fs from "fs"
import { glob } from "glob"
import inquirer from "inquirer"
import * as path from "path"
import * as url from "url"

import { logger } from "@next-boilerplate/lib"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const filesCache: Record<string, string> = {}

export const replaceTokens = async () => {
  const tokens: { message: string; token: string; id: string }[] = [
    {
      message: "What is the project name?",
      id: "PROJECT_NAME",
      token: "next-boilerplate",
    },
  ]
  const answers = await inquirer.prompt(
    tokens.map((token) => ({
      type: "input",
      name: token.id,
      message: token.message,
      validate: (input) => {
        // Slug
        if (token.id === "PROJECT_NAME") {
          if (!/^[a-z0-9-]+$/.test(input)) return "The project name must be a slug"
        }
        return true
      },
    }))
  )
  const tokensWithAnswers = tokens.map((token) => ({
    ...token,
    answer: answers[token.id],
  }))

  //? Replace all tokens in the files
  for (const token of tokensWithAnswers) {
    //? Replace in all files
    // Function to replace text in a file
    const search = token.token
    const value = token.answer
    async function replaceTextInFile(filePath: string, baseDir: string) {
      const getFileContent = async () => {
        if (filesCache[filePath]) return filesCache[filePath]
        try {
          const content = await fs.promises.readFile(filePath, "utf8")
          filesCache[filePath] = content
          return content
        } catch (error) {
          logger.error(`Error reading file ${filePath}`)
          return null
        }
      }
      const content = await getFileContent()
      if (content) {
        if (content.includes(search)) {
          const replacedContent = content.replaceAll(search, value)
          await fs.promises.writeFile(filePath, replacedContent, "utf8")
          logger.log(chalk.gray(`Done for ${filePath.replace(baseDir, "")}`))
        } else {
          logger.log(chalk.gray(`Checked ${filePath.replace(baseDir, "")}`))
        }
      }
    }

    // Function to recursively search and replace in all files
    async function replaceInDirectory(dir: string) {
      const ignore = [
        // Common ignore
        `${dir}/**/node_modules/**`,
        `${dir}/**/dist/**`,
        `${dir}/**/build/**`,
        `${dir}/**/.next/**`,
        `${dir}/**/.terraform/**`,
        `${dir}/**/.git/**`,
        `${dir}/**/.idea/**`,
        `${dir}/**/.vscode/**`,
        `${dir}/**/.turbo/**`,
        // Custom ignore
        `${dir}/README.md`,
        `${dir}/package-lock.json`,
      ]
      const files = await glob(`${dir}/**`, {
        ignore,
        nodir: true,
        dot: true,
      })
      const allFiles = files
      await Promise.all(allFiles.map((file) => replaceTextInFile(file, dir)))
    }

    const rootDir = path.join(__dirname, "..", "..")
    await replaceInDirectory(rootDir)
  }

  const rootDir = path.join(__dirname, "..", "..")
  //? Reinstall dependencies
  logger.log(chalk.blue("Reinstalling dependencies..."))
  execSync("rm -rf node_modules", {
    cwd: rootDir,
  })
  execSync("npm install", {
    cwd: rootDir,
    stdio: "inherit",
  })
  logger.log(chalk.gray("Done!"))
}
