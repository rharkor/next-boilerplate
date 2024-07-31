// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require("path")

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    project: join(__dirname, "/tsconfig.json"),
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["custom/base"],
}
