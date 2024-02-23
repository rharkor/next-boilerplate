//! CHALK DOESNT SUPPORT EDGE RUNTIME (ex: middleware)
import chalk from "chalk"

const allowDebug = process.env.NODE_ENV !== "production"

const console = global.console

// Basic Colors
const black = "#000000"
const text = "#CDCDCD"
const yellow = "#F3F99D"
const orange = "#F9CB8F"
const red = "#F09393"
const green = "#7EE081"
const blue = "#7DCFEA"
const gray = "#686868"

const printColor =
  (bg?: string, text?: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any) => {
    const data = args
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((arg: any) => {
        if (typeof arg === "object") {
          return arg.toString()
        }
        return arg
      })
      .join(" ")
    if (bg && text) return chalk.bgHex(bg).hex(text)(data)
    if (bg) return chalk.bgHex(bg)(data)
    if (text) return chalk.hex(text)(data)
  }

const log = printColor(undefined, text)

const warn = printColor(yellow, black)
const warnText = printColor(undefined, yellow)

const debug = printColor(orange, black)
const debugText = printColor(undefined, orange)

const error = printColor(red, black)
const errorText = printColor(undefined, red)

const success = printColor(green, black)
const successText = printColor(undefined, green)

const info = printColor(blue, black)
const infoText = printColor(undefined, blue)

const subLog = printColor(undefined, gray)

export const logger: typeof console & {
  success: (typeof console)["log"]
  subLog: (typeof console)["log"]
  allowDebug: boolean
} = {
  ...console,
  allowDebug,
  log: (...args: Parameters<(typeof console)["log"]>) => {
    console.log(log(...args))
  },
  debug: (...args: unknown[]) => {
    if (allowDebug) {
      console.debug(debug(" DEBUG "), debugText(...args))
    }
  },
  warn: (...args: unknown[]) => {
    console.warn(warn(" WARN "), warnText(...args))
  },
  error: (...args: unknown[]) => {
    console.error(error(" ERROR "), errorText(...args))
  },
  trace: (...args: unknown[]) => {
    console.trace(error(" ERROR "), errorText(...args))
  },
  success: (...args: unknown[]) => {
    console.log(success(" SUCCESS "), successText(...args))
  },
  info: (...args: unknown[]) => {
    console.log(info(" INFO "), infoText(...args))
  },
  subLog: (...args: unknown[]) => {
    console.log(subLog(...args))
  },
}
