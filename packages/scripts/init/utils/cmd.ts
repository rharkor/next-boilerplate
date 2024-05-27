import { exec as pexec } from "child_process"
import ora from "ora"
import { stderr } from "process"

import { logger, windowLog } from "@next-boilerplate/lib"

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
    stderr.write("\n")
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
