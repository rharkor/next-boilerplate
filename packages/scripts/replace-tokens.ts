/**
 * This script replaces all tokens like #{TOKEN_NAME}# in the files
 * This script is intended to run only once at the beginning of the project
 */

import chalk from "chalk"
import * as fs from "fs"
import inquirer from "inquirer"
import * as path from "path"
import * as url from "url"

import { logger } from "@lib/logger"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const filesToCheck = ["../docker/docker-compose.yml", "app/src/api/auth/mutations.ts"]

//? Find all tokens of all the files in the root directory
const findTokens: () => {
  [filePath: string]: string[]
} = () => {
  const tokens: {
    [filePath: string]: string[]
  } = {}
  filesToCheck.forEach((file) => {
    const filePath = path.join(__dirname, "..", file)
    const fileContent = fs.readFileSync(filePath, "utf8")
    const regex = /#{(.*?)}#/g
    let match
    while ((match = regex.exec(fileContent)) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++
      if ((tokens[filePath] as string[] | undefined) && !tokens[filePath].includes(match[1]))
        tokens[filePath].push(match[1])
      else tokens[filePath] = [match[1]]
    }
  })
  return tokens
}

export const replaceTokens = async () => {
  const tokens = findTokens()

  const allTokens = Array.from(new Set(Object.values(tokens).flat()))
  const allTokensValues: {
    [token: string]: string
  } = {}
  let i = 0
  for (const token of allTokens) {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "token",
        message: `What is the value of ${token}?`,
        prefix: `🔑 [${i + 1}/${allTokens.length}]`,
      },
    ])
    allTokensValues[token] = answers.token
    i++
  }

  //? Replace all tokens in the files
  for (const [filePath, fileTokens] of Object.entries(tokens)) {
    const fileContent = fs.readFileSync(filePath, "utf8")
    let newFileContent = fileContent
    for (const token of fileTokens) {
      if (!allTokensValues[token]) continue
      newFileContent = newFileContent.replaceAll(`#{${token}}#`, allTokensValues[token])
      logger.log(chalk.gray(`Done for ${filePath}`))
      if (token === "PROJECT_NAME") {
        //? Replace the project name in the devcontainer.json & package.json
        const nameToReplace = "next-boilerplate"
        const newProjectName = allTokensValues[token]
        const devContainerFile = path.join(__dirname, "../../.devcontainer/devcontainer.json")
        const devContainerFileContent = fs.readFileSync(devContainerFile, "utf8")
        const newDevContainerFileContent = devContainerFileContent.replaceAll(nameToReplace, newProjectName)
        fs.writeFileSync(devContainerFile, newDevContainerFileContent, "utf8")
        logger.log(chalk.gray(`Done for ${devContainerFile}`))
        const packages = fs.readdirSync(path.join(__dirname, ".."))
        const pJsonFiles = [
          path.join(__dirname, "../../package.json"),
          ...packages.map((p) => path.join(__dirname, "..", p, "package.json")),
        ]
        for (const pJsonFile of pJsonFiles) {
          if (!fs.existsSync(pJsonFile)) continue
          const pJsonFileContent = fs.readFileSync(pJsonFile, "utf8")
          const newPJsonFileContent = pJsonFileContent.replaceAll(nameToReplace, newProjectName)
          fs.writeFileSync(pJsonFile, newPJsonFileContent, "utf8")
          logger.log(chalk.gray(`Done for ${pJsonFile}`))
        }
      }
    }
    fs.writeFileSync(filePath, newFileContent, "utf8")
  }
}
