import type { Options } from "prettier"

import baseConfig from "./base"

const config: Options = {
  ...baseConfig,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn"],
}

export default config
