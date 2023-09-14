/**
 * This script replaces all tokens like #{TOKEN_NAME}# in the files
 * This script is intended to run only once at the beginning of the project
 */

import chalk from "chalk"
import * as fs from "fs"
import { stdin as input, stdout as output } from "node:process"
import * as readline from "node:readline/promises"
import * as path from "path"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const filesToCheck = ["docker/docker-compose.yml"]

//? Find all tokens of all the files in the root directory
const findTokens = () => {
  const tokens: string[] = []
  filesToCheck.forEach((file) => {
    const filePath = path.join(__dirname, "..", file)
    const fileContent = fs.readFileSync(filePath, "utf8")
    const regex = /#{(.*?)}#/g
    let match
    while ((match = regex.exec(fileContent)) !== null) {
      tokens.push(match[1])
    }
  })
  return tokens
}

//? Function replace in file
const replace = async (options: { files: string[]; from: RegExp; to: string }) => {
  const { files, from, to } = options
  const promises: Promise<void>[] = []
  files.forEach((file) => {
    const promise = new Promise<void>((resolve, reject) => {
      try {
        const filePath = path.join(__dirname, "..", file)
        const fileContent = fs.readFileSync(filePath, "utf8")
        const newFileContent = fileContent.replace(from, to)
        fs.writeFileSync(filePath, newFileContent)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
    promises.push(promise)
  })
  return Promise.all(promises).then(() => {
    return files
  })
}

//? Replace a token in files
const replaceToken = async (token: string, value: string) => {
  const options = {
    files: filesToCheck,
    from: new RegExp(`#{${token}}#`, "g"),
    to: value,
  }
  try {
    await replace(options)
  } catch (error) {
    console.error("Error occurred:", error)
  }
}

export const replaceTokens = async () => {
  return new Promise<void>(async (resolve) => {
    const tokens = findTokens()
    console.log(chalk.blue(`Tokens found: ${tokens.join(", ")}`))
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      //? Ask for the value of the token
      const rl = readline.createInterface({ input, output })
      const value = await rl.question(chalk.blue(`Value for the token ${token}: `))
      if (!value) {
        console.log(chalk.yellowBright("No value provided, skipping..."))
        // throw new Error(`No value provided for the token ${token}`)
      }
      //? Replace the token with the value
      if (!value) continue
      await replaceToken(token, value)
      console.log(chalk.green(`Token ${token} replaced with ${value}`))
      rl.close()
    }

    resolve()
  })
}
