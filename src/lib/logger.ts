const allowDebug = process.env.NODE_ENV !== "production"
const yellowBright = (str: string) => `\x1b[33m${str}\x1b[0m`

export const logger = {
  allowDebug,
  ...console,
  debug: (...args: unknown[]) => {
    if (allowDebug) {
      console.debug(yellowBright("[DEBUG]"), ...args)
    }
  },
  time: (label: string) => {
    if (allowDebug) {
      console.time(label)
    }
  },
  timeEnd: (label: string) => {
    if (allowDebug) {
      console.timeEnd(label)
    }
  },
}
