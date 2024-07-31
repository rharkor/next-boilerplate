/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";
const noUseClient = require("./no-use-client");
const noNodeModulesImport = require("./no-node-modules-import");
const handleApiError = require("./handle-api-error");

module.exports = {
  meta: {
    name: "eslint-plugin-no-use-client",
    version: "1.0.0",
  },
  rules: {
    "no-use-client": noUseClient,
    "no-node-modules-import": noNodeModulesImport,
    "handle-api-error": handleApiError,
  },
};
