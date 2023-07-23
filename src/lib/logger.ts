const allowDebug = process.env.NODE_ENV !== "production"

export const logger = {
  ...console,
  debug: (...args: unknown[]) => {
    if (allowDebug) {
      console.debug(...args)
    }
  },
}
