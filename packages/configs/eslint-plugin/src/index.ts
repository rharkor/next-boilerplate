import type { ESLint } from "eslint"

import handleApiError from "./handle-api-error"
import noNodeModulesImport from "./no-node-modules-import"
import noUseClient from "./no-use-client"

const rules: ESLint.Plugin = {
  rules: {
    "no-use-client": noUseClient,
    "no-node-modules-import": noNodeModulesImport,
    "handle-api-error": handleApiError,
  },
}

export default rules
