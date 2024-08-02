import type { Options } from "prettier"
import baseConfig from "./base"

const config: Options = {
  ...baseConfig,
  plugins: ["prettier-plugin-tailwindcss"],
}

export default config
