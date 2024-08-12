#!/usr/bin/env zx

/**
 * Search for banned keywords in the source code. And exit with an error if any
 */

import { $ } from "zx"

import { cwdAtRoot } from "@/utils"
import { task } from "@rharkor/task"

import "zx/globals"

cwdAtRoot()

const keywords = ["TODO", "FIXME"]

const dirExclusions = ["node_modules", "dist", "build", ".next", ".git", ".terraform"]
const fileExclusions = ["README.md", "banned-keywords.ts", "banned-keywords.sh"]
const searchDir = "."

const exclusions: string[] = [
  ...dirExclusions.map((dir) => `--exclude-dir=${dir}`),
  ...fileExclusions.map((file) => `--exclude=${file}`),
]
const searchTask = await task.startTask({
  name: "Searching for banned keywords... 🚫",
})

let foundBannedKeywords = false
for (const keyword of keywords) {
  searchTask.log(`Searching for ${keyword}`)
  try {
    const grepResult = await $`grep -r "${keyword}" ${searchDir} ${exclusions}`

    if (grepResult.stdout) {
      foundBannedKeywords = true
      searchTask.error(`Found banned keyword ${keyword}`)
      searchTask.error(grepResult.stdout)
    }
  } catch {
    // Do nothing
  }
}
if (!foundBannedKeywords) {
  searchTask.stop("No banned keywords found! 🎉")
} else {
  searchTask.stop()
  process.exit(1)
}
