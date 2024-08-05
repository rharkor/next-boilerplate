#!/usr/bin/env zx

/**
 * Search for unused and missing dependencies in the source code. And exit with an error if any
 */

import depcheck from "depcheck"
import { $ } from "zx"

import { cwdAtRoot, getRoot } from "@/utils"
import { task } from "@rharkor/logger"

import "zx/globals"

cwdAtRoot()
const root = getRoot()

const depcheckTask = await task.startTask({
  name: "Checking for unused/missing dependencies... 🧐",
})

//* Find all packages in the monorepo
depcheckTask.print("Reading package.json")
const packageJson = (await $`cat package.json`.json()) as { workspaces: string[] }

//* Get all the packages paths
depcheckTask.print("Finding all packages paths")
//? Get the packages directories from the workspaces in the package.json
const dirPackagesPaths = packageJson.workspaces
//? Go into each child of the packages directory and get the path
const allPossiblePackagesPaths = (
  (
    await Promise.all(
      dirPackagesPaths.map(async (dir) => {
        try {
          const globDir = await glob(dir, { onlyDirectories: true, cwd: $.cwd })
          if (globDir.length === 0) return
          const { stdout } = await $({ quiet: true })`ls -d ${globDir}`
          return stdout.split("\n").filter(Boolean)
        } catch {
          depcheckTask.warn(`Error getting the packages paths for ${dir}`)
        }
      })
    )
  ).filter(Boolean) as string[][]
).flat()
//? Filter all the paths if they contain a package.json
const packages: { path: string; name: string }[] = allPossiblePackagesPaths
  .filter((p) => {
    const pjsonPath = path.join($.cwd ?? "", p, "package.json")
    if (fs.existsSync(pjsonPath)) return true
    return false
  })
  .map((p) => {
    const pjsonPath = path.join($.cwd ?? "", p, "package.json")
    const pjson = JSON.parse(fs.readFileSync(pjsonPath, "utf-8")) as { name: string }
    return { path: p, name: pjson.name }
  })

//* Treat each package
depcheckTask.print("Checking each package")
let message = ""
let hasError = false

const beautify = (arr: string[]) => {
  return arr
    .map((item) => {
      return `  - ${item}`
    })
    .join("\n")
}

for (const pkg of packages) {
  const packagePath = path.join(root, pkg.path)
  depcheckTask.print(`Checking ${packagePath}`)

  //* Options for depcheck
  const options: depcheck.Options = {}
  /**
 * File format:
  {
      "ignoreMatches": []
  }
 * File name:
  depcheck.json
 */
  //? Check if any options file exists
  const optionsPath = path.join(packagePath, "depcheck.json")
  if (fs.existsSync(optionsPath)) {
    depcheckTask.print(`Found options file for ${pkg.name}`)
    const optionsFile = JSON.parse(fs.readFileSync(optionsPath, "utf-8")) as {
      ignoreMatches?: string[]
    }
    options.ignoreMatches = optionsFile.ignoreMatches
  }

  const depcheckResult = await depcheck(packagePath, options)

  const hasUnusedDeps = depcheckResult.dependencies.length > 0
  if (hasUnusedDeps) {
    message += `${pkg.name + " has unused dependencies:"}\n${beautify(depcheckResult.dependencies)}\n`
  }

  const hasUnusedDevDeps = depcheckResult.devDependencies.length > 0
  if (hasUnusedDevDeps) {
    message += `${pkg.name + " has unused devDependencies:"}\n${beautify(depcheckResult.devDependencies)}\n`
  }

  const hasMissing = Object.keys(depcheckResult.missing).length > 0
  if (hasMissing) {
    message += `${pkg.name + " has missing dependencies:"}\n${beautify(Object.keys(depcheckResult.missing))}\n`
  }

  if (hasUnusedDeps || hasUnusedDevDeps || hasMissing) {
    hasError = true
    message += "\n"
  }
}

if (hasError) {
  depcheckTask.error(message)
  depcheckTask.stop()
  process.exit(1)
}

depcheckTask.stop("No unused or missing dependencies found! 🎉")
