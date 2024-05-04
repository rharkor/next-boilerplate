import { exec as pexec } from "child_process"
import ora from "ora"
import { stderr } from "process"

import { logger } from "@next-boilerplate/lib"
import { loggerExtra } from "@next-boilerplate/lib/dist/logger"

/**
 * Clear the last lines of the terminal
 * @param count
 */
const clearLastLines = (count: number) => {
  for (let i = 0; i < count; i++) {
    stderr.moveCursor(0, -1) // Move cursor up one line
    stderr.clearLine(0) // Clear the current line
  }
}

/**
 * Maintain a max number of lines in the terminal like a window
 */
export const windowLog = (
  maxLines: number,
  opts?: { noPrint?: boolean; topPrefix?: () => string; topInterval?: number }
) => {
  const lines: string[] = []
  let numberOfLines = 0
  let prefixValue = ""
  const handleLine = (line: string | null) => {
    const toClear = Math.min(numberOfLines, maxLines)
    clearLastLines(toClear)

    const columns = process.stdout.columns

    if (line) {
      lines.push(line)
      // Add the number of lines based on the line length and the columns
      const lineLength = Math.ceil(line.length / columns)
      numberOfLines += lineLength
    }
    if (numberOfLines > maxLines) {
      const removedLine = lines.shift()
      if (removedLine) {
        const removedLineLength = Math.ceil(removedLine.length / columns)
        numberOfLines -= removedLineLength
      }
    }
    const printable = lines.map((l) => {
      const value = loggerExtra.printColor.log(...loggerExtra.addPrefixToArgs(logger.prefix, l)) as string
      return value
    })
    if (!opts?.noPrint) {
      // Print the top prefix
      if (opts?.topPrefix) {
        if (line === null) {
          clearLastLines(1)
          prefixValue = opts.topPrefix()
          stderr.write(prefixValue + "\n")
        } else {
          clearLastLines(1)
          stderr.write(prefixValue + "\n")
        }
      }
      // Print the lines
      printable.forEach((l) => {
        stderr.write(l)
      })
    }
    return printable
  }

  let interval: NodeJS.Timeout | null = null
  if (opts) {
    const { topInterval, topPrefix } = opts
    if (topInterval && topPrefix)
      interval = setInterval(() => {
        handleLine(null)
      }, topInterval)
  }

  const stop = (successMessage?: string) => {
    if (interval) {
      clearInterval(interval)
    }
    const toClear = Math.min(numberOfLines, maxLines) + 1
    clearLastLines(toClear)
    if (successMessage) {
      logger.success(successMessage)
    }
  }

  return { print: handleLine, stop }
}

interface ExecOptions {
  maxLines?: number
  successMessage: string
  name: string
  cwd?: string
}

export function exec(command: string, options: ExecOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const { maxLines = 10, successMessage, name } = options

    const spinner = ora({
      text: name,
      isSilent: true,
      isEnabled: false,
    }).start()
    const window = windowLog(maxLines, {
      topPrefix: () => spinner.frame(),
      topInterval: 100,
    })

    const child = pexec(command, { cwd: options.cwd })

    child.stdout?.on("data", (data: Buffer) => {
      const lines = data
        .toString()
        .split("\n")
        .filter((l) => l.length > 0)
      lines.forEach((line) => {
        window.print(line + "\n")
      })
    })

    child.stderr?.on("data", (data: Buffer) => {
      logger.error(data.toString())
    })

    child.on("close", (code) => {
      if (code === 0) {
        window.stop(successMessage)
        resolve()
      } else {
        window.stop()
        reject()
      }
    })
  })
}

export function startTask(options: { name: string; successMessage: string; maxLines?: number }) {
  const { maxLines = 10, name, successMessage } = options
  const spinner = ora({
    text: name,
    isSilent: true,
    isEnabled: false,
  }).start()
  const window = windowLog(maxLines, {
    topPrefix: () => spinner.frame(),
    topInterval: 100,
  })
  return {
    print: (data: string) => {
      const lines = data
        .toString()
        .split("\n")
        .filter((l) => l.length > 0)
      lines.forEach((line) => {
        window.print(line + "\n")
      })
    },
    stop: () => {
      window.stop()
      logger.success(successMessage)
    },
  }
}

export function stopTask(window: ReturnType<typeof windowLog>) {
  window.stop()
}
