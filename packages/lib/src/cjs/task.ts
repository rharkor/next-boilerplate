import { Options, Ora } from "ora"
import { stderr } from "process"

import { logger, loggerExtra } from "./logger"

let gOra: ((options?: string | Options | undefined) => Ora) | null = null
const getOra = async () => {
  if (gOra) return gOra
  const ora = await import("ora").then((m) => m.default)
  gOra = ora
  return ora
}

/**
 * Clear the last lines of the terminal
 * @param count
 */
const clearLastLines = (count: number) => {
  for (let i = 0; i < count; i++) {
    stderr.moveCursor?.(0, -1) // Move cursor up one line
    stderr.clearLine?.(0) // Clear the current line
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
  let hasPrintedTopPrefix = false
  let prefixValue = ""
  const handleLine = (line: string | null) => {
    const rows = process.stdout.rows
    maxLines = Math.min(maxLines, rows - 1 - (opts?.topPrefix ? 1 : 0))

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
        if (hasPrintedTopPrefix) {
          clearLastLines(1)
        }
        if (line === null) {
          prefixValue = opts.topPrefix()
        }
        stderr.write(prefixValue + "\n")
        hasPrintedTopPrefix = true
      }
      // Print the lines
      printable.forEach((l) => {
        stderr.write(l)
      })
    }
    return printable
  }

  const print = (line: string) => {
    handleLine(line)
  }

  let interval: NodeJS.Timeout | null = null
  if (opts) {
    handleLine(null)
    const { topInterval, topPrefix } = opts
    if (topInterval && topPrefix)
      interval = setInterval(() => {
        handleLine(null)
      }, topInterval)
  }

  const stop = (successMessage?: string, noClear?: boolean) => {
    if (interval) {
      clearInterval(interval)
    }
    if (!noClear) {
      const toClear = Math.min(numberOfLines, maxLines) + 1
      clearLastLines(toClear)
    }
    if (successMessage) {
      logger.success(successMessage)
    }
  }

  return { print, stop }
}

/**
 * Start a task with a spinner and a window log
 * @param options
 * @returns
 */
export async function startTask(options: {
  name: string
  successMessage?: string
  maxLines?: number
  noClear?: boolean
}) {
  const { maxLines = 10, name, successMessage } = options
  const ora = await getOra()
  const spinner = ora({
    text: name,
    isSilent: true,
    isEnabled: false,
  }).start()
  const window = windowLog(maxLines, {
    topPrefix: () => spinner.frame(),
    topInterval: 100,
  })
  const rows = process.stdout.rows
  const curMax = Math.min(maxLines, rows - 2)
  return {
    print: (data: string) => {
      const lines = data
        .toString()
        .split("\n")
        .filter((l) => l.length > 0)
        .slice(-curMax - 1)
      lines.forEach((line) => {
        window.print(line + "\n")
      })
    },
    stop: (message?: string) => {
      window.stop(message ?? successMessage, options.noClear)
    },
  }
}

/**
 * Stop a task
 * @param window
 */
export function stopTask(window: ReturnType<typeof windowLog>, message?: string) {
  window.stop(message)
}
