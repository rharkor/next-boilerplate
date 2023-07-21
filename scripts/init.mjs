/**
 * This script replaces all tokens like #{TOKEN_NAME}# in the files
 * This script is intended to run only once at the beginning of the project
 */

import * as fs from "fs"
import { stdin as input, stdout as output } from "node:process"
import * as readline from "node:readline/promises"
import * as path from "path"
import { exit } from "process"
import * as url from "url"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))

const filesToCheck = [".devcontainer/devcontainer.json", "docker/docker-compose.yml"]

//? Find all tokens of all the files in the root directory
const findTokens = () => {
  const tokens = []
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
const replace = async (options) => {
  const { files, from, to } = options
  const promises = []
  files.forEach((file) => {
    const promise = new Promise((resolve, reject) => {
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
const replaceToken = async (token, value) => {
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

const main = async () => {
  const tokens = findTokens()
  console.log("Tokens found:", tokens.join(", "))
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    //? Ask for the value of the token
    const rl = readline.createInterface({ input, output })
    const value = await rl.question(`\x1b[34mValue for the token ${token}: \x1b[0m`)
    if (!value) throw new Error(`No value provided for the token ${token}`)
    //? Replace the token with the value
    await replaceToken(token, value)
    console.log(`\x1b[32mToken ${token} replaced with ${value}\x1b[0m`)
    rl.close()
  }

  console.log("*".repeat(50))
  console.log("\x1b[32mAll tokens replaced successfully\x1b[0m")
  console.log("\x1b[31mDon't forget to change the license\x1b[0m")
  console.log("*".repeat(50))

  exit(0)
}

main()
