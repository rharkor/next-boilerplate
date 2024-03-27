"use strict";
const noUseClient = require("./no-use-client");

module.exports = {
  meta: {
    name: "eslint-plugin-no-use-client",
    version: "1.0.0",
  },
  rules: {
    "no-use-client": noUseClient,
  },
};
